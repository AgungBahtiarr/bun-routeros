import { describe, it, expect, afterAll } from 'bun:test';
import { RouterOSAPI } from '../src';
import { config } from './config';

describe('RouterOSAPI', () => {
    describe('#write()', () => {
        const conn = new RouterOSAPI({
            host: config.host,
            user: config.user,
            password: config.password,
        });

        const address = '192.168.84.10/24';
        let address_id: string | null = null;

        it('should add address ' + address + ' to interface ether2', async () => {
            await conn.connect();
            const data: any = await conn.write('/ip/address/add', [
                '=address=' + address,
                '=interface=ether2',
            ]);
            expect(data[0].ret).toBeDefined();
            address_id = data[0].ret;
        });

        it('should print address ' + address + ' from interface ether2', async () => {
            const data: any = await conn.write('/ip/address/print', [
                '?address=' + address,
            ]);
            expect(data[0].address).toBe(address);
        });

        it('should remove address ' + address + ' from interface ether2', async () => {
            const data = await conn.write('/ip/address/remove', [
                '=.id=' + address_id,
            ]);
            expect(data.length).toBe(0);
        });

        afterAll(async () => {
            await conn.close();
        });
    });
});
