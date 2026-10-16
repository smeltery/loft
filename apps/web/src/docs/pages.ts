export interface DocSection {
  id: string
  title: string
  paragraphs: string[]
  diagram?: 'storage' | 'sharing'
  items?: string[]
  code?: string
  language?: string
  table?: string[][]
  links?: { label: string; href: string }[]
}
export interface DocPage {
  path: string
  title: string
  group: string
  description: string
  sections: DocSection[]
}
const modules = import.meta.glob<DocPage>('./content/**/*.json', {
  eager: true,
  import: 'default',
})
export const docGroups = [
  'Start here',
  'Guides',
  'Reference',
  'API endpoints',
  'Examples',
]
export const pages = Object.values(modules).sort((a, b) => {
  const group = docGroups.indexOf(a.group) - docGroups.indexOf(b.group)
  if (group) return group
  if (a.path === '/docs' || a.path === '/docs/examples') return -1
  if (b.path === '/docs' || b.path === '/docs/examples') return 1
  return a.title.localeCompare(b.title)
})
export function findPage(path: string) {
  return pages.find((page) => page.path === path.replace(/\/$/, ''))
}
