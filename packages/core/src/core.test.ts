import { describe, expect, test } from 'bun:test'
import { catalog, diskBytes, formatSize, infoWhere } from './catalog'
import { menuTitles } from './chrome'
import { searchDrive, shareUrl } from './links'

describe('drive catalog', () => {
  test('cloud files use zero bytes on disk until kept', () => {
    const film = catalog[0]
    expect(film).toBeDefined()
    if (!film) throw new Error('missing film')
    expect(diskBytes(false, film.bytes)).toBe(0)
    expect(diskBytes(true, film.bytes)).toBe(film.bytes)
    expect(infoWhere(film)).toBe('Loft › Client Work')
    expect(formatSize(film.bytes)).toContain('GB')
  })
})

describe('app chrome', () => {
  test('status menu matches the public product chrome', () => {
    expect(menuTitles()).toEqual([
      'Search Loft',
      'Open in Finder',
      'Your Account',
      'Send Feedback',
      'Settings…',
      'Quit Loft',
    ])
  })

  test('search and share stay on loft urls', () => {
    const hits = searchDrive('wedding')
    const hit = hits[0]
    expect(hit?.name).toBe('wedding-film_final.mov')
    expect(hit ? shareUrl('https://loft.example', hit) : '').toBe(
      'https://loft.example/s/wedding',
    )
  })
})
