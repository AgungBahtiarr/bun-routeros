# bun-routeros

# Description

This is a Mikrotik Routerboard API written in TypeScript and optimized for Bun, utilizing Bun's native high-performance socket client (`Bun.connect`). It can be used in both JavaScript and TypeScript projects inside the Bun runtime.

# Features

-   Built on Bun's native TCP/TLS socket client (`Bun.connect`).
-   Connection and reconnection without destroying the object.
-   Change host, username, and other parameters of the object without recreating it.
-   Based on promises.
-   You can choose to keep the connection alive if it gets idle.
-   Every command is async, but can be synced using promises.
-   Can pause, resume, and stop streams (like what you get from `/tool/torch`).
-   Support for languages with accents, keeping it consistent throughout WinBox and API.
-   Compatible with RouterOS v7.18+ (handles `!empty` replies gracefully).

# Installing

```bash
bun add bun-routeros
```

# Examples

Importing in TypeScript:

```typescript
import { RouterOSAPI } from 'bun-routeros';
```

Adding an IP address to ether2, printing it, then removing it synchronously:

```javascript
const { RouterOSAPI } = require('bun-routeros');

const conn = new RouterOSAPI({
    host: '192.168.88.1',
    user: 'admin',
    password: '',
});

conn.connect()
    .then(() => {
        // Connection successful

        // Let's add an IP address to ether2
        conn.write('/ip/address/add', [
            '=interface=ether2',
            '=address=192.168.90.1',
        ])
            .then((data) => {
                console.log('192.168.90.1 added to ether2!', data);

                // Added the ip address, let's print it
                return conn.write('/ip/address/print', ['?.id=' + data[0].ret]);
            })
            .then((data) => {
                console.log('Printing address info: ', data);

                // We got the address added, let's clean it up
                return conn.write('/ip/address/remove', [
                    '=.id=' + data[0]['.id'],
                ]);
            })
            .then((data) => {
                console.log('192.168.90.1 as removed from ether2!', data);

                // The address was removed! We are done, let's close the connection
                conn.close();
            })
            .catch((err) => {
                // Oops, got an error
                console.log(err);
            });
    })
    .catch((err) => {
        // Got an error while trying to connect
        console.log(err);
    });
```

Listening to data from `/tool/torch` and using pause/resume/stop features:

```javascript
const { RouterOSAPI } = require("bun-routeros");

const conn = new RouterOSAPI({
    host: "192.168.88.1",
    user: "admin",
    password: ""
});

conn.connect().then(() => {
    // Counter to trigger pause/resume/stop
    let i = 0;

    // The stream function returns a Stream object which can be used to pause/resume/stop the stream
    const addressStream = conn.stream(['/tool/torch', '=interface=ether1'], (error, packet) => {
        // If there is any error, the stream stops immediately
        if (!error) {
            console.log(packet);

            // Increment the counter
            i++;

            // if the counter hits 30, we stop the stream
            if (i === 30) {

                // Stopping the stream will return a promise
                addressStream.stop().then(() => {
                    console.log('should stop');
                    // Once stopped, you can't start it again
                    conn.close();
                }).catch((err) => {
                    console.log(err);
                });

            } else if (i % 5 === 0) {

                // If the counter is multiple of 5, we will pause it
                addressStream.pause().then(() => {
                    console.log('should be paused');

                    // And after it is paused, we resume after 3 seconds
                    setTimeout(() => {
                        addressStream.resume().then(() => {
                            console.log('should resume');
                        }).catch((err) => {
                            console.log(err);
                        });
                    }, 3000);

                }).catch((err) => {
                    console.log(err);
                });

            }

        } else {
            console.log(error);
        }
    });

}).catch((err) => {
    // Got an error while trying to connect
    console.log(err);
});
```

# Development

To make changes to this repository, you should be familiar with Bun and TypeScript.

## Installing Dependencies

```bash
bun install
```

## Running Tests

Configure connection credentials by copying `.env.example` to `.env` and updating the values. Then run:

```bash
bun test
```

## Building

To compile TypeScript source files into `dist/` with `.d.ts` declaration files:

```bash
bun run build
```

# Credits

This project is based on the original `node-routeros` library by [Aluísio Rodrigues Amaral](https://github.com/aluisiora/node-routeros), which was built on the work of [George Joseph](https://github.com/f5eng/mikronode-ng) and [Brandon Myers](https://github.com/Trakkasure/mikronode).

# License

MIT License - see [LICENSE](LICENSE) for details.
