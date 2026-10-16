import { createRoot } from 'react-dom/client'
import { DocsPage } from './DocsPage'
import { findPage } from './pages'

const page = findPage(window.location.pathname)
document.title = `${page?.title ?? 'Page not found'} — loft docs`
document
  .querySelector('meta[name="description"]')
  ?.setAttribute(
    'content',
    page?.description ?? 'Documentation for your self-hosted loft drive.',
  )
const root = document.getElementById('root')
if (!root) throw new Error('missing #root')
createRoot(root).render(<DocsPage />)
