const { RStream } = require('../src/RStream');
const { Channel } = require('../src/Channel');
const { expect } = require('chai');

describe('RStream AsyncIterator', () => {
    it('should support consuming streams via for await loop', async () => {
        let streamListener = null;
        let cancelCalled = false;
        const listeners = new Map();

        const fakeConnector = {
            read: (tag, cb) => {
                listeners.set(tag, cb);
            },
            write: (params) => {
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
            stopRead: (tag) => {
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

        expect(packets.length).to.equal(3);
        expect(packets[0]).to.deep.equal({ rx: '1000', tx: '2000' });
        expect(packets[1]).to.deep.equal({ rx: '3000', tx: '4000' });
        expect(packets[2]).to.deep.equal({ rx: '5000', tx: '6000' });
        expect(cancelCalled).to.equal(true);
    });
});
