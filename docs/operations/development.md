# Development

`flox activate` installs Bun, git, gh, pre-commit, actionlint, and shellcheck,
then points git at `.githooks`.

Those hooks run `.pre-commit-config.yaml`, which is the same set of checks as
CI: format, lint, types, tests, markdown, mermaid, doc links, file-size
budgets, flat-directory budgets, and actionlint. Pre-push runs `bun run ci`.

```mermaid
flowchart LR
  edit[Edit]
  hook[pre-commit]
  push[pre-push bun ci]
  gh[GitHub Actions]
  edit --> hook --> push --> gh
```

If a file grows past 400 lines, split by responsibility before raising the
budget.
