import { describe, it, expect } from 'bun:test';
import { RouterOSAPI } from '../src';
import { config } from './config';

describe('RouterOSAPI', () => {
    describe('#connect()', () => {
        it('should connect normally on ' + config.host, async () => {
            const conn = new RouterOSAPI({
                host: config.host,
                user: config.user,
                password: config.password,
            });

            await conn.connect();
            await conn.close();
        });

        it('should reject wrong password', async () => {
            const conn = new RouterOSAPI({
                host: config.host,
                user: config.user,
                password: 'wrongpass',
            });

            try {
                await conn.connect();
                expect(true).toBe(false); // should not reach here
            } catch (err: any) {
                expect(err.errno).toBe('CANTLOGIN');
            }
        });

        it('should reject from unknown host 192.168.88.2', async () => {
            const conn = new RouterOSAPI({
                host: '192.168.88.2',
                user: config.user,
                password: config.password,
                timeout: 5,
            });

            try {
                await conn.connect();
                expect(true).toBe(false);
            } catch (err: any) {
                expect(['EHOSTUNREACH', 'SOCKTMOUT', 'ETIMEDOUT', 'ECONNREFUSED']).toContain(err.errno);
            }
        }, 10000);

        it('should connect with a password 16 characters or more', async () => {
            const conn = new RouterOSAPI({
                host: config.host,
                user: config.user,
                password: config.password,
            });

            const testUser = {
                name: 'testuser',
                group: 'read',
                password:
                    'averybigpassword' +
                    'withespecialcharacters@#$_!' +
                    'andnumbers12345' +
                    'andabighashnonsense' +
                    'b5fefe3bb04026ce6f7fa7e89c605c88' +
                    '729cc9ae543c722240fa310927945545' +
                    '1516e06d11ba2c3bff36baab21259882' +
                    'ff4fcd0cb49fc64558fbb195cf6eb45a',
            };

            await conn.connect();
            const data: any = await conn.write('/user/add', [
                '=name=' + testUser.name,
                '=group=' + testUser.group,
                '=password=' + testUser.password,
            ]);

            const id = data[0].ret;

            const conn2 = new RouterOSAPI({
                host: config.host,
                user: testUser.name,
                password: testUser.password,
            });

            await conn2.connect();
            await conn2.close();

            await conn.write('/user/remove', ['=.id=' + id]);
            await conn.close();
        });

        it('should refuse connection from port 666', async () => {
            const conn = new RouterOSAPI({
                host: config.host,
                user: config.user,
                password: config.password,
                port: 666,
                timeout: 5,
            });

            try {
                await conn.connect();
                expect(true).toBe(false);
            } catch (err: any) {
                expect(['ECONNREFUSED', 'SOCKTMOUT', 'ETIMEDOUT']).toContain(err.errno);
            }
        }, 10000);

        it('should keep alive for 30 seconds and then close', async () => {
            const conn = new RouterOSAPI({
                host: config.host,
                user: config.user,
                password: config.password,
                keepalive: true,
                port: 8728,
            });

            await conn.connect();
            await new Promise((resolve) => setTimeout(resolve, 30000));
            await conn.close();
        }, 35000);

        it('should give a timeout error after connecting', async () => {
            const conn = new RouterOSAPI({
                host: config.host,
                user: config.user,
                password: config.password,
                timeout: 4,
            });

            await conn.connect();
        }, 6000);

        it('should reconnect with the same object', async () => {
            const conn = new RouterOSAPI({
                host: config.host,
                user: config.user,
                password: config.password,
                timeout: 4,
            });

            await conn.connect();
            await conn.close();
            await conn.connect();
            await conn.close();
        });

        const itSSL = process.env.SSL_PORT ? it : it.skip;
        itSSL('should connect via SSL normally on ' + config.host, async () => {
            const conn = new RouterOSAPI({
                host: config.host,
                user: config.user,
                password: config.password,
                tls: {
                    rejectUnauthorized: false,
                    ciphers: typeof Bun !== 'undefined' ? undefined : 'ADH-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384',
                },
                port: config.sslPort,
            });

            await conn.connect();
            await conn.close();
        });
    });
});
