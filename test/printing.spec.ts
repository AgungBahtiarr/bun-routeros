import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { RouterOSAPI } from '../src';
import { config } from './config';

let conn: RouterOSAPI;

describe('RosApiOperations', () => {
    beforeAll(async () => {
        conn = new RouterOSAPI({
            host: config.host,
            user: config.user,
            password: config.password,
            keepalive: true,
        });
        await conn.connect();
    });

    it('should get all interfaces from /interface', async () => {
        const interfaces = await conn.write(['/interface/print']);
        expect(interfaces.length).toBeGreaterThan(0);
    });

    it('should get only id and name from /interface', async () => {
        const interfaces: any = await conn.write([
            '/interface/print',
            '=.proplist=.id,name',
        ]);
        expect(interfaces[0]['.id']).toBeDefined();
        expect(interfaces[0].name).toBeDefined();
        expect(interfaces[0].type).toBeUndefined();
    });

    it('should get a single user using the writeStream command', (done) => {
        const chann = conn.writeStream(['/user/print', '?name=admin']);
        chann.on('data', (data: any) => {
            expect(data.name).toBe('admin');
        });

        let gotDone = false;
        let gotTrapped = false;

        chann.once('done', () => {
            gotDone = true;
        });

        chann.once('trap', () => {
            gotTrapped = true;
        });

        chann.once('close', () => {
            expect(gotDone).toBe(true);
            expect(gotTrapped).toBe(false);
            done();
        });
    });

    it('should throw a trap using the writeStream command', (done) => {
        const chann = conn.writeStream('somethingthatdoesntexist');

        let gotData = 'gotnodata';

        chann.on('data', (data: any) => {
            gotData = data;
        });

        let gotDone = false;
        let gotTrapped = false;
        let gotError = false;
        let theTrap: any = {};

        chann.once('done', () => {
            gotDone = true;
        });

        chann.once('trap', (trap) => {
            theTrap = trap;
            gotTrapped = true;
        });

        chann.once('error', (trap) => {
            gotError = true;
        });

        chann.once('close', () => {
            expect(gotData).toBe('gotnodata');
            expect(theTrap.message).toBe('no such command prefix');
            expect(gotDone).toBe(false);
            expect(gotTrapped).toBe(true);
            expect(gotError).toBe(true);
            done();
        });
    });

    it('should stop streaming with writeStream after 5 seconds', (done) => {
        const chann = conn.writeStream('/ip/address/listen');

        let gotDone = false;
        let gotTrapped = false;
        let gotData = 'gotnodata';

        chann.on('data', (data) => {
            gotData = 'gotsomedata';
        });

        chann.once('done', () => {
            gotDone = true;
        });

        chann.once('trap', () => {
            gotTrapped = true;
        });

        chann.once('close', () => {
            expect(gotData).toBe('gotnodata');
            expect(gotDone).toBe(true);
            expect(gotTrapped).toBe(false);
            done();
        });

        setTimeout(() => {
            chann.close();
        }, 5000);
    }, 7000);

    afterAll(async () => {
        if (conn) {
            await conn.close();
        }
    });
});
