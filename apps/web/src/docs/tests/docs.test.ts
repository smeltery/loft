import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pageMarkdown } from '../actions/markdown'
import type { DocPage } from '../pages'
import { highlightCode } from '../rendering/highlight'
import { searchPages } from '../search'

const directory = join(import.meta.dir, '../content')
const pages = readdirSync(directory, { recursive: true })
  .filter((name) => String(name).endsWith('.json'))
  .map(
    (name) =>
      JSON.parse(
        readFileSync(join(directory, String(name)), 'utf8'),
      ) as DocPage,
  )

describe('documentation content', () => {
  test('every page and section has a unique address and all related links resolve', () => {
    expect(new Set(pages.map((page) => page.path)).size).toBe(pages.length)
    for (const page of pages) {
      expect(page.title.length).toBeGreaterThan(0)
      expect(page.description.length).toBeGreaterThan(0)
      expect(new Set(page.sections.map((section) => section.id)).size).toBe(
        page.sections.length,
      )
      for (const section of page.sections) {
        for (const link of section.links ?? []) {
          const [path, hash] = link.href.split('#')
          const target = pages.find((candidate) => candidate.path === path)
          expect(target).toBeDefined()
          if (hash)
            expect(
              target?.sections.some((candidate) => candidate.id === hash),
            ).toBe(true)
        }
      }
    }
  })

  test('search finds setup instructions, specific configuration, and empty states', () => {
    expect(searchPages(pages, 'Docker deployment')[0]?.href).toBe(
      '/docs/guides/deployment',
    )
    expect(
      searchPages(pages, 'LOFT_SIGNING_KEY').some(
        (result) => result.page.path === '/docs/reference/configuration',
      ),
    ).toBe(true)
    expect(searchPages(pages, 'zz-no-such-topic')).toEqual([])
    expect(searchPages(pages, '')[0]?.href).toBe('/docs')
  })

  test('markdown includes useful commands, links, tables, and the storage diagram', () => {
    const overview = pageMarkdown(pages.find((page) => page.path === '/docs'))
    expect(overview).toContain('sequenceDiagram')
    expect(overview).toContain('[Quick start](/docs/quick-start)')
    expect(
      pageMarkdown(pages.find((page) => page.path === '/docs/quick-start')),
    ).toContain('bun install --frozen-lockfile')
    expect(
      pageMarkdown(
        pages.find((page) => page.path === '/docs/reference/configuration'),
      ),
    ).toContain('| LOFT_TOKEN |')
  })

  test('highlighting escapes untrusted code before emitting markup', () => {
    const source = '<script>alert("unsafe")</script>'
    expect(highlightCode(source, 'Example')).not.toContain('<script>')
    expect(highlightCode(source, 'JavaScript')).not.toContain('<script>')
  })
})
