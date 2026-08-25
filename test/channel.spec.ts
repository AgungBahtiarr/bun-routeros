import { describe, it, expect } from 'bun:test';
import { Channel } from '../src/Channel';

describe('Channel', () => {
    it('should generate sequential unique channel IDs', () => {
        const fakeConnector: any = { stopRead: () => {} };
        const ch1 = new Channel(fakeConnector);
        const ch2 = new Channel(fakeConnector);

        expect(ch1.Id).toBeTypeOf('string');
        expect(ch2.Id).toBeTypeOf('string');
        expect(ch1.Id).not.toBe(ch2.Id);
    });

    it('should parse packets with complex key-values, multiple equals, and empty values', async () => {
        let readCallback: any = null;
        const fakeConnector: any = {
            read: (tag: string, cb: any) => {
                readCallback = cb;
            },
            write: (params: string[]) => {
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
        const data = await channel.write(['/interface/print']);
        expect(data.length).toBe(1);
        expect(data[0]).toEqual({
            name: 'ether1',
            comment: 'vlan=10=office',
            disabled: '',
            mtu: '1500',
        });
    });
});
