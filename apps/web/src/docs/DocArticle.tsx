import { BrandIcon } from './BrandIcon'
import { CodeBlock } from './CodeBlock'
import { DocCards } from './DocCards'
import { type DocPage, pages } from './pages'
import { SequenceDiagram } from './rendering/SequenceDiagram'

export function DocArticle({ page }: { page: DocPage }) {
  const index = pages.indexOf(page)
  const next = pages[index + 1]
  return (
    <>
      <header className="doc-article-heading">
        <p className="eyebrow">{page.group}</p>
        <div className="doc-brands">
          {page.path === '/docs/quick-start' && <BrandIcon name="Docker" />}
        </div>
        <h1>{page.title}</h1>
        <p className="docs-lead">{page.description}</p>
      </header>
      {page.sections.map((section) => (
        <section id={section.id} key={section.id}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {section.diagram && <SequenceDiagram kind={section.diagram} />}
          {section.items && (
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.table && (
            <div className="docs-table">
              <table>
                <thead>
                  <tr>
                    {section.table[0]?.map((cell) => (
                      <th key={cell}>{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.slice(1).map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell) => (
                        <td key={cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {section.code && (
            <CodeBlock
              label={section.language ?? 'Example'}
              code={section.code}
            />
          )}
          {section.links && <DocCards links={section.links} />}
        </section>
      ))}
      {next && (
        <a className="doc-next" href={next.path}>
          <span>Continue reading</span>
          {next.title} →
        </a>
      )}
    </>
  )
}
