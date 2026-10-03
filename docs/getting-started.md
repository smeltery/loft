# Getting started

You need [Flox](https://flox.dev) or a local [Bun](https://bun.sh/) 1.4 install.

```bash
flox activate
bun install --frozen-lockfile
bun run dev
```

Open `http://localhost:3000`. Request-files landings use `/r/<token>`.

On macOS:

```bash
bun run macos:test
scripts/package-macos.sh
open dist/Loft.app
```

```mermaid
flowchart LR
  clone[Clone repo]
  flox[flox activate]
  install[bun install]
  dev[bun run dev]
  clone --> flox --> install --> dev
```

`bun run ci` is the full local gate. Git hooks call the same scripts.
