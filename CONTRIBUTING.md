# Contributing

## Environment

```bash
flox activate
bun install --frozen-lockfile
pre-commit install
pre-commit run --all-files
```

Flox sets `core.hooksPath` to `.githooks`. Those hooks run the same checks as
`.github/workflows/ci.yml`.

## Commands

| Command | What it runs |
| --- | --- |
| `bun run dev` | Vite on port 3000 |
| `bun run test` | Unit tests |
| `bun run ci` | format, lint, types, tests, build, docs, budgets |

Open a pull request against `main`. Do not skip hooks unless you are unblocking
a broken tool, and say so in the PR.
