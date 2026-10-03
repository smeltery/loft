# CI

`ci.yml` runs on pull requests and on `main`. The Ubuntu jobs enter Flox so the
runner uses the locked toolchain. The macOS job uses Xcode Swift.

```mermaid
flowchart TB
  pr[PR or main]
  q[quality: format lint types tests build]
  m[macos: LoftKitCheck and Loft build]
  h[hygiene: markdown mermaid links budgets actionlint]
  pr --> q
  pr --> m
  pr --> h
```

| Job | Runner | Checks |
| --- | --- | --- |
| quality | Blacksmith Ubuntu 4 vCPU | `bun run` format, lint, typecheck, test, build |
| macos | Blacksmith macOS 15 | `swift run LoftKitCheck` and `swift build` for Loft.app |
| hygiene | Blacksmith Ubuntu 2 vCPU | docs, LOC budgets, actionlint, `git diff --check` |

A green `ci` run on `main` is what [auto-release](releasing.md) waits for.
