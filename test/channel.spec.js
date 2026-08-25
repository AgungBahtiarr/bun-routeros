const { Channel } = require('../src/Channel');
const { expect } = require('chai');

describe('Channel', () => {
    it('should generate sequential unique channel IDs', () => {
        const fakeConnector = { stopRead: () => {} };
        const ch1 = new Channel(fakeConnector);
        const ch2 = new Channel(fakeConnector);

        expect(ch1.Id).to.be.a('string');
        expect(ch2.Id).to.be.a('string');
        expect(ch1.Id).to.not.equal(ch2.Id);
    });

    it('should parse packets with complex key-values, multiple equals, and empty values', (done) => {
        let readCallback = null;
        const fakeConnector = {
            read: (tag, cb) => {
                readCallback = cb;
            },
            write: (params) => {
                // Simulate RouterOS response
                if (readCallback) {
                    readCallback([
                        '!re',
                        '=name=ether1',
                        '=comment=vlan=10=office',
                        '=disabled=',
                        '=mtu=1500',
                    ]);
                    readCallback(['!done']);
                }
            },
            stopRead: () => {},
        };

        const channel = new Channel(fakeConnector);
        channel
            .write(['/interface/print'])
            .then((data) => {
                expect(data.length).to.equal(1);
                expect(data[0]).to.deep.equal({
                    name: 'ether1',
                    comment: 'vlan=10=office',
                    disabled: '',
                    mtu: '1500',
                });
                done();
            })
            .catch(done);
    });
});
