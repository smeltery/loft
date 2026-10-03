import { describe, expect, test } from 'bun:test'
import { renderToString } from 'react-dom/server'
import App from './App'
import { faqs, site } from './copy'

describe('marketing page', () => {
  test('renders loft branding, not the reference product name', () => {
    const html = renderToString(<App />)
    expect(html).toContain(site.headline)
    expect(html).toContain(site.lede)
    expect(html.toLowerCase()).not.toContain('helumi')
    expect(html).toContain(faqs[0]?.q)
  })
})
