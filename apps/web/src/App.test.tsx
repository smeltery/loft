import { describe, expect, test } from 'bun:test'
import { renderToString } from 'react-dom/server'
import App from './App'
import { faqs, site } from './copy'
import { RequestPage } from './request-page'
import { requestTokenFrom } from './request-token'

describe('marketing page', () => {
  test('renders loft branding, not the reference product name', () => {
    const html = renderToString(<App />)
    expect(html).toContain(site.headline)
    expect(html).toContain(site.lede)
    expect(html.toLowerCase()).not.toContain('helumi')
    expect(html).toContain(faqs[0]?.q)
  })
})

describe('request files', () => {
  test('parses /r tokens', () => {
    expect(requestTokenFrom('/r/demo', '')).toBe('demo')
    expect(requestTokenFrom('/', '?r=alt')).toBe('alt')
  })

  test('landing copy is loft-branded', () => {
    const html = renderToString(<RequestPage token="demo" />)
    expect(html).toContain('Files you add go straight to their Loft.')
    expect(html.toLowerCase()).not.toContain('helumi')
  })
})
