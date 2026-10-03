#!/usr/bin/env bun
import { $ } from 'bun'
import { parseHTML } from 'linkedom'

const { window } = parseHTML('<!doctype html><html><body></body></html>')
const purify = {
  addHook() {},
  removeHook() {},
  sanitize(html: string) {
    return html
  },
}

Object.assign(globalThis, {
  window,
  document: window.document,
  DOMParser: window.DOMParser,
  XMLSerializer: window.XMLSerializer,
  navigator: window.navigator,
  DOMPurify: purify,
})

const mermaid = (await import('mermaid')).default
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })

const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const files = (await $`git ls-files -- "*.md" "*.mdx"`.text())
  .split('\n')
  .filter(Boolean)

let blockCount = 0
let failures = 0

for (const file of files) {
  const text = await Bun.file(`${repoRoot}/${file}`).text()
  const lines = text.split('\n')
  let inBlock = false
  let start = 0
  const body: string[] = []
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? ''
    if (!inBlock && /^```mermaid\s*$/.test(line)) {
      inBlock = true
      start = i + 1
      body.length = 0
      continue
    }
    if (inBlock && /^```\s*$/.test(line)) {
      inBlock = false
      blockCount += 1
      const diagram = body.join('\n')
      try {
        await mermaid.parse(diagram)
      } catch (error) {
        failures += 1
        const message = error instanceof Error ? error.message : String(error)
        console.error(`error: ${file}:${start} invalid mermaid diagram`)
        console.error(message)
      }
      continue
    }
    if (inBlock) body.push(line)
  }
}

if (blockCount === 0) {
  console.log('check-mermaid: no mermaid diagrams found')
  process.exit(0)
}

if (failures > 0) {
  console.error(
    `error: ${failures} of ${blockCount} mermaid diagram(s) failed to parse`,
  )
  process.exit(1)
}

console.log(
  `check-mermaid: all ${blockCount} mermaid diagram(s) parsed successfully`,
)
