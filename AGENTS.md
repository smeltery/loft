# loft contributor instructions

Loft is a static marketing site. Keep the page a 1:1 visual of the public
product layout, with loft branding only.

## Working rules

- Use Bun and root scripts. `bun run ci` must stay green.
- Enter the Flox env (`flox activate`) so Bun, pre-commit, actionlint, and
  shellcheck match CI.
- Keep files under the LOC budgets in `scripts/file-size-budgets.json`.
- Do not add auth, billing backends, or a real filesystem driver in this repo.

## Verification

Run `bun run ci`, then load the changed page in a browser.
