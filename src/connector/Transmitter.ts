import * as iconv from 'iconv-lite';
import debug from 'debug';

const info = debug('routeros-api:connector:transmitter:info');
const error = debug('routeros-api:connector:transmitter:error');

export type RosEncoding = 'utf-8' | 'win1252' | string;

/**
 * Class responsible for transmitting data over the
 * socket to the routerboard
 */
export class Transmitter {
    /**
     * The socket which connects to the routerboard
     */
    private socket: any;

    /**
     * Pool of data to be sent after the socket connects
     */
    private pool: Buffer[] = [];

    /**
     * Encoding to use for sending data
     */
    private encoding: RosEncoding;

    /**
     * Constructor
     *
     * @param socket
     * @param encoding
     */
    constructor(socket?: any, encoding: RosEncoding = 'win1252') {
        this.socket = socket;
        this.encoding = encoding;
    }

    /**
     * Write data over the socket, if it not writable yet,
     * save over the pool to be ran after
     *
     * @param {string | null} data
     */
    public write(data: string | null): void {
        const encodedData = this.encodeString(data);
        if (!this.socket || !this.socket.writable || this.pool.length > 0) {
            info('Socket not writable, saving %o in the pool', data);
            this.pool.push(encodedData);
        } else {
            info('Writing command %s over the socket', data);
            this.socket.write(encodedData);
        }
    }

    /**
     * Writes all data stored in the pool
     */
    public runPool(): void {
        info('Running stacked command pool');
        while (this.pool.length > 0) {
            const data = this.pool.shift();
            if (data && this.socket && this.socket.writable) {
                this.socket.write(data);
            }
        }
    }

    /**
     * Encode the string data that will
     * be sent over to the routerboard.
     *
     * @param {string | null} str
     * @returns {Buffer}
     */
    public encodeString(str: string | null): Buffer {
        if (str === null) return Buffer.from([0x00]);

        const encoded =
            this.encoding === 'utf-8'
                ? Buffer.from(str, 'utf-8')
                : iconv.encode(str, this.encoding || 'win1252');

        let data: Buffer;
        let len = encoded.length;
        let offset = 0;

        if (len < 0x80) {
            data = Buffer.allocUnsafe(len + 1);
            data[offset++] = len;
        } else if (len < 0x4000) {
            data = Buffer.allocUnsafe(len + 2);
            len |= 0x8000;
            data[offset++] = (len >> 8) & 0xff;
            data[offset++] = len & 0xff;
        } else if (len < 0x200000) {
            data = Buffer.allocUnsafe(len + 3);
            len |= 0xc00000;
            data[offset++] = (len >> 16) & 0xff;
            data[offset++] = (len >> 8) & 0xff;
            data[offset++] = len & 0xff;
        } else if (len < 0x10000000) {
            data = Buffer.allocUnsafe(len + 4);
            len |= 0xe0000000;
            data[offset++] = (len >> 24) & 0xff;
            data[offset++] = (len >> 16) & 0xff;
            data[offset++] = (len >> 8) & 0xff;
            data[offset++] = len & 0xff;
        } else {
            data = Buffer.allocUnsafe(len + 5);
            data[offset++] = 0xf0;
            data[offset++] = (len >> 24) & 0xff;
            data[offset++] = (len >> 16) & 0xff;
            data[offset++] = (len >> 8) & 0xff;
            data[offset++] = len & 0xff;
        }

        encoded.copy(data, offset);
        return data;
    }
}
