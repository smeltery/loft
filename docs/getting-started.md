# Getting started

You need [Flox](https://flox.dev) or a local [Bun](https://bun.sh/) 1.4 install.

```bash
flox activate
bun install --frozen-lockfile
bun run dev
```

Open `http://localhost:3000`. The page is a single marketing surface: hero,
Finder mock, how it works, comparison, plan, FAQ, and download.

```mermaid
flowchart LR
  clone[Clone repo]
  flox[flox activate]
  install[bun install]
  dev[bun run dev]
  clone --> flox --> install --> dev
```

`bun run ci` is the full local gate. Git hooks call the same scripts.
