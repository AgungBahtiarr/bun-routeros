# Changelog

## 1.0.0 (2026-08-25) — Initial Release for Bun

Modern, high-performance MikroTik RouterOS API client built specifically for the **Bun** runtime. Forked and reimagined from `node-routeros`.

### 🚀 Highlights & New Features
- **Native Bun Sockets:** Replaced Node.js `net.Socket` / `tls.TLSSocket` with Bun's native high-performance TCP socket client (`Bun.connect`).
- **AsyncIterator & `for await` Streaming:** `RStream` now implements `AsyncIterable<T>`. You can stream router events (e.g. `/tool/torch`, `/interface/monitor-traffic`) fluently using `for await (const packet of conn.streamIterator(...))` with automatic lifecycle cleanup upon `break`.
- **Fluent Query Builder (`RosQuery` / `rosQuery`):** Built-in chainable command and filter builder with support for `.where()`, `.whereNot()`, `.whereLess()`, `.whereGreater()`, `.whereExists()`, `.whereMissing()`, `.and()`, `.or()`, `.not()`, `.prop()`, `.props()`, and `.proplist()`.
- **Flexible Encoding:** Added support for `utf-8` alongside standard `win1252` encoding in `IRosOptions`.
- **RouterOS v7.18+ Compatibility:** Graceful handling of RouterOS v7 `!empty` reply traps and multi-version authentication challenge mechanisms.
- **TypeScript Strict Mode & Generics:** Full strict mode (`"strict": true`) with Generic return type support across `write<T>()`, `stream<T>()`, and `streamIterator<T>()`.

### ⚡ Performance & Memory Optimizations
- **$O(1)$ Zero-Recursion Receiver:** Replaced recursive processing closures and $O(N)$ array shifts with an iterative queue to eliminate call stack overflow risks during heavy router data dumps.
- **Fast Buffer Parsing:** Optimized packet key-value slicing using direct index scanning, eliminating redundant string array allocations and preserving values containing equal signs (`=`).
- **Zero-Copy Slicing:** Utilized `Buffer.subarray()` and `Buffer.allocUnsafe()` for maximum throughput.
- **Socket Backpressure:** Handled socket `drain` events during bulk transmissions.

### 🧪 Tooling & Testing
- Migrated test suite to native `bun:test` with TypeScript `.spec.ts` files, removing external test dependencies (`chai`, `mocha`).
- Automated TypeScript build pipeline using `bunx tsc`.

---

## Legacy (node-routeros)

### 1.6.3 (2019-09-02)
- Handle authentication challenge buffer as 16 bit.

### 1.6.0 (2019-01-02)
- Added `writeStream` function which returns an `RStream` object to optionally stream content by listening to events (`data`, `trap`, `done`, `close`).

### 1.5.1 (2018-10-25)
- Added ability to login to 6.43+ firmware with fallback to challenge / response method.
- Added TLS option for no certificates to test suite.

### 1.4.0 (2018-03-06)
- Localization support removed.

