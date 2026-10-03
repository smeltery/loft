# loft

[![CI](https://github.com/smeltery/loft/actions/workflows/ci.yml/badge.svg)](https://github.com/smeltery/loft/actions/workflows/ci.yml)
[![License: PolyForm Shield 1.0.0](https://img.shields.io/badge/license-PolyForm%20Shield%201.0.0-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/bun-1.4-black?logo=bun&logoColor=white)](https://bun.sh/)
[![Swift](https://img.shields.io/badge/Swift-6-f05138?logo=swift&logoColor=white)](https://www.swift.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Flox](https://img.shields.io/badge/dev%20env-flox-7c3aed.svg)](https://flox.dev)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](.pre-commit-config.yaml)

**loft** is a Finder drive: terabytes in the cloud, zero bytes on your Mac. This
monorepo holds the marketing site, storage API, and the macOS menu-bar app.

## Quick start

```bash
flox activate
bun install --frozen-lockfile
bun run dev
```

On a Mac, `bun run macos:build` then `open dist/Loft.app`.

`bun run ci` is the same gate GitHub Actions and the git hooks run.

## Docs

- [Product](docs/product.md)
- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Cloud](docs/cloud.md)
- [macOS app](docs/macos.md)
- [Operations](docs/operations/README.md)

## License

[PolyForm Shield 1.0.0](LICENSE)
