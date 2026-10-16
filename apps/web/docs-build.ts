import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Plugin } from 'vite'

export function docsPages(): Plugin {
  return {
    name: 'loft-doc-pages',
    closeBundle() {
      const source = readFileSync('dist/index.html', 'utf8')
      const content = 'src/docs/content'
      for (const file of readdirSync(content, { recursive: true })) {
        if (!String(file).endsWith('.json')) continue
        const page = JSON.parse(
          readFileSync(join(content, String(file)), 'utf8'),
        ) as { path: string; title: string; description: string }
        const escapeHTML = (value: string) =>
          value
            .replaceAll('&', '&amp;')
            .replaceAll('"', '&quot;')
            .replaceAll('<', '&lt;')
        const html = source
          .replace(
            /<title>.*?<\/title>/s,
            () => `<title>${escapeHTML(page.title)} — loft docs</title>`,
          )
          .replace(
            /(<meta\s+name="description"\s+content=")[^"]*(")/s,
            (_, before, after) => before + escapeHTML(page.description) + after,
          )
        const output = join('dist', page.path, 'index.html')
        mkdirSync(dirname(output), { recursive: true })
        writeFileSync(output, html)
      }
    },
  }
}
