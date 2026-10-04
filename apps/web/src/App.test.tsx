import { describe, expect, test } from 'bun:test'
import { renderToString } from 'react-dom/server'
import App from './App'
import { faqs, site } from './copy'
import { RequestPage } from './request-page'
import { requestTokenFrom } from './request-token'
import { appPathFrom } from './app-route'
import { AppShell } from './app-shell'
import { shareIdFrom } from './share-id'
import { SharePage } from './share-page'

describe('marketing page', () => {
  test('renders loft branding, not the reference product name', () => {
    const html = renderToString(<App />)
    expect(html).toContain('meet')
    expect(html).toContain(site.name)
    expect(html).toContain('without')
    expect(html).toContain('Client Work')
    expect(html).toContain('download for mac')
    expect(html).toContain('free forever')
    expect(html).toContain('privacy')
    expect(html).toContain('orbit-mark')
    expect(html).toContain('forest-6')
    expect(html).toContain('How loft looks in finder')
    expect(html.toLowerCase()).not.toContain('helumi')
    expect(html).toContain(faqs[0]?.q)
  })
})

describe('request files', () => {
  test('parses /r tokens', () => {
    expect(requestTokenFrom('/r/demo', '')).toBe('demo')
    expect(requestTokenFrom('/', '?r=alt')).toBe('alt')
    expect(shareIdFrom('/s/clip', '?exp=1&sig=x')).toBe('clip')
    expect(appPathFrom('/app/plan')).toBe('/app/plan')
  })

  test('landing copy is loft-branded', () => {
    const html = renderToString(<RequestPage token="demo" />)
    expect(html).toContain('Files you add go straight to their Loft.')
    expect(html).toContain('/brand/logo.svg')
    expect(html.toLowerCase()).not.toContain('helumi')
  })

  test('share page streams from the storage api', () => {
    const html = renderToString(<SharePage id="clip" />)
    expect(html).toContain('clip')
    expect(html).toContain('127.0.0.1:8787/s/clip')
  })
})

describe('account app', () => {
  test('account shell uses the product mark and loft copy', () => {
    const html = renderToString(<AppShell path="/app" />)
    expect(html).toContain('/brand/logo.svg')
    expect(html).toContain('loading your account')
    expect(html).not.toContain('1.2 TB')
    expect(html).not.toContain('Zero KB')
    expect(html.toLowerCase()).not.toContain('helumi')
  })
})
