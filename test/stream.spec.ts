import { describe, it, expect } from 'bun:test';
import { RStream } from '../src/RStream';
import { Channel } from '../src/Channel';

describe('RStream AsyncIterator', () => {
    it('should support consuming streams via for await loop', async () => {
        let cancelCalled = false;
        const listeners = new Map<string, (packet: string[]) => void>();

        const fakeConnector: any = {
            read: (tag: string, cb: any) => {
                listeners.set(tag, cb);
            },
            write: (params: string[]) => {
                if (params[0] === '/cancel') {
                    cancelCalled = true;
                    // Extract tag of the cancel request
                    const tagParam = params.find((p) => p.startsWith('.tag='));
                    if (tagParam) {
                        const tag = tagParam.substring(5);
                        const cb = listeners.get(tag);
                        if (cb) {
                            setTimeout(() => cb(['!done']), 5);
                        }
                    }
                }
            },
            stopRead: (tag: string) => {
                listeners.delete(tag);
            },
        };

        const channel = new Channel(fakeConnector);
        const stream = new RStream(channel, ['/tool/torch', '=interface=ether1']);
        stream.start();

        // Simulate incoming stream packets
        setTimeout(() => {
            channel.emit('stream', { rx: '1000', tx: '2000' });
            channel.emit('stream', { rx: '3000', tx: '4000' });
            channel.emit('stream', { rx: '5000', tx: '6000' });
        }, 10);

        const packets = [];
        for await (const packet of stream) {
            packets.push(packet);
            if (packets.length === 3) {
                break;
            }
        }

        expect(packets.length).toBe(3);
        expect(packets[0]).toEqual({ rx: '1000', tx: '2000' });
        expect(packets[1]).toEqual({ rx: '3000', tx: '4000' });
        expect(packets[2]).toEqual({ rx: '5000', tx: '6000' });
        expect(cancelCalled).toBe(true);
    });
});
