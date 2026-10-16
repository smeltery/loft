import type { DocPage } from '../pages'

export function pageMarkdown(page?: DocPage): string {
  if (!page) return '# loft documentation'
  const parts = [`# ${page.title}`, page.description]
  for (const section of page.sections) {
    parts.push(`## ${section.title}`, ...section.paragraphs)
    if (section.diagram)
      parts.push(
        section.diagram === 'storage'
          ? '```mermaid\nsequenceDiagram\n  participant Mac\n  participant API\n  participant Storage\n  Mac->>API: Request file range\n  API->>Storage: Read bytes\n  Storage-->>API: Requested bytes\n  API-->>Mac: 206 Partial Content\n```'
          : '```mermaid\nsequenceDiagram\n  participant Owner\n  participant API\n  participant Recipient\n  Owner->>API: Issue share link\n  API-->>Owner: Signed URL\n  Recipient->>API: Open signed link\n  API-->>Recipient: File bytes\n```',
      )
    if (section.items)
      parts.push(section.items.map((item) => `- ${item}`).join('\n'))
    if (section.table) {
      const rows = section.table.map(
        (row) =>
          `| ${row.map((cell) => cell.replaceAll('|', '\\|')).join(' | ')} |`,
      )
      rows.splice(1, 0, `| ${section.table[0]?.map(() => '---').join(' | ')} |`)
      parts.push(rows.join('\n'))
    }
    if (section.code)
      parts.push(
        `\`\`\`${section.language?.toLowerCase() ?? ''}\n${section.code}\n\`\`\``,
      )
    if (section.links)
      parts.push(
        section.links
          .map((link) => `- [${link.label}](${link.href})`)
          .join('\n'),
      )
  }
  return parts.join('\n\n')
}
