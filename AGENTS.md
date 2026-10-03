# loft contributor instructions

Loft is a monorepo: marketing site plus macOS menu-bar app. Keep branding loft
only. Status-menu titles live in `packages/core` and `apps/macos` LoftKit and
must stay identical.

## Working rules

- Use Bun and root scripts. `bun run ci` must stay green.
- Enter the Flox env (`flox activate`) so Bun, pre-commit, actionlint, and
  shellcheck match CI.
- Swift work is in `apps/macos`. Linux CI skips the Swift toolchain; the
  `macos` GitHub job runs `swift run LoftKitCheck` and `swift build`.
- Keep files under the LOC budgets in `scripts/file-size-budgets.json`.

## Verification

Run `bun run ci`. On a Mac, also launch `dist/Loft.app` and walk the status
menu, search, drop, settings, and Open in Finder.
