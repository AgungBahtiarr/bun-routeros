# bun-routeros

# Description

This is a Mikrotik Routerboard API written in TypeScript and optimized for Bun, utilizing Bun's native high-performance socket client (`Bun.connect`). It can be used in both JavaScript and TypeScript projects inside the Bun runtime.

# Features

-   Built on Bun's native TCP/TLS socket client (`Bun.connect`).
-   Connection and reconnection without destroying the object.
-   Change host, username, and other parameters of the object without recreating it.
-   Based on promises and modern `async`/`await`.
-   **AsyncIterator & `for await`** support for consuming data streams fluently.
-   **Fluent Query Builder (`RosQuery` / `rosQuery`)** for easy MikroTik API command and filter generation.
-   **Configurable encoding (`utf-8` or `win1252`)** for seamless multi-language compatibility.
-   **High-performance parsing & zero-recursion queue** optimized for massive data packets.
-   TypeScript **strict mode** with full Generic Type support (`conn.write<T>()`).
-   Compatible with RouterOS v7.18+ (handles `!empty` replies gracefully).

# Installing

```bash
bun add bun-routeros
```

# Examples

Importing in TypeScript:

```typescript
import { RouterOSAPI, rosQuery, RosQuery } from 'bun-routeros';
```

### Fluent Query Builder & Type-Safe Write

```typescript
import { RouterOSAPI, rosQuery } from 'bun-routeros';

interface InterfaceItem {
    '.id': string;
    name: string;
    type: string;
    disabled: string;
}

const conn = new RouterOSAPI({
    host: '192.168.88.1',
    user: 'admin',
    password: '',
});

await conn.connect();

// Using the fluent query builder
const query = rosQuery('/interface/print')
    .where('type', 'ether')
    .whereNot('disabled', 'yes')
    .and()
    .proplist('.id', 'name', 'type', 'disabled')
    .build();

const interfaces = await conn.write<InterfaceItem>(query);
console.log('Active ethernet interfaces:', interfaces);

await conn.close();
```

### Streaming with Modern `for await` (AsyncIterator)

```typescript
import { RouterOSAPI } from 'bun-routeros';

const conn = new RouterOSAPI({
    host: '192.168.88.1',
    user: 'admin',
    password: '',
});

await conn.connect();

// Stream continuous data using for await
for await (const packet of conn.streamIterator('/tool/torch', '=interface=ether1')) {
    console.log('Torch data:', packet);

    // Break whenever you want; the stream will automatically stop cleanly
    if (someCondition) {
        break;
    }
}

await conn.close();
```

### Adding an IP address to ether2, printing, and cleaning up:

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
        return conn.write('/ip/address/add', [
            '=interface=ether2',
            '=address=192.168.90.1/24',
        ]);
    })
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
        console.log('Address removed from ether2!');
        return conn.close();
    })
    .catch((err) => {
        console.error('Error:', err);
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
