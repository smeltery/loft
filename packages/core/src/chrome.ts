import chrome from '../chrome.json'

export type MenuRow =
  | { id: string; separator: true }
  | {
      id: string
      title: string
      shortcut?: string
      trailing?: string
      separator?: false
    }

export const chromeCopy = chrome

export const statusMenu = chrome.menu as MenuRow[]

export const finderContext = chrome.context

export function menuTitles(): string[] {
  return statusMenu
    .filter((row) => !('separator' in row && row.separator))
    .map((row) => ('title' in row ? row.title : ''))
    .filter(Boolean)
}
