#!/usr/bin/env bun
import { $ } from 'bun'
import { lint } from 'markdownlint/sync'

const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const files = (await $`git ls-files -- "*.md"`.text())
  .split('\n')
  .filter(Boolean)
  .map((file) => `${repoRoot}/${file}`)

const result = lint({
  files,
  config: {
    default: true,
    MD013: false,
    MD014: false,
    MD033: false,
    MD034: false,
    MD040: false,
    MD041: true,
    MD051: false,
  },
})

let fail = false
for (const [file, findings] of Object.entries(result)) {
  if (!findings?.length) continue
  fail = true
  for (const finding of findings) {
    const rel = file.startsWith(`${repoRoot}/`)
      ? file.slice(repoRoot.length + 1)
      : file
    console.error(
      `${rel}:${finding.lineNumber} ${finding.ruleNames.join('/')} ${finding.ruleDescription}`,
    )
  }
}

if (fail) process.exit(1)

console.log(`markdownlint passed (${files.length} files)`)
