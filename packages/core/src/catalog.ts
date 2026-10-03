export type DriveFile = {
  id: string
  name: string
  kind: string
  bytes: number
  folder: string
}

export const driveRoot = 'Loft'

export const folders = ['Client Work', 'Films', 'Brand'] as const

export const catalog: DriveFile[] = [
  {
    id: 'wedding',
    name: 'wedding-film_final.mov',
    kind: 'QuickTime movie',
    bytes: 48_213_574_021,
    folder: 'Client Work',
  },
  {
    id: 'notes',
    name: 'Edit Notes.md',
    kind: 'Markdown',
    bytes: 12_288,
    folder: 'Client Work',
  },
  {
    id: 'deck',
    name: 'Pitch Deck.pdf',
    kind: 'PDF',
    bytes: 50_331_648,
    folder: 'Client Work',
  },
  {
    id: 'drone',
    name: 'drone-coast_4k.mp4',
    kind: 'MPEG-4 movie',
    bytes: 21_700_000_000,
    folder: 'Films',
  },
  {
    id: 'brand',
    name: 'Brand Shoot.jpg',
    kind: 'JPEG image',
    bytes: 18_400_000,
    folder: 'Brand',
  },
  {
    id: 'album',
    name: 'Album Cover.psd',
    kind: 'Photoshop',
    bytes: 2_300_000_000,
    folder: 'Brand',
  },
  {
    id: 'broll',
    name: 'interview-broll.mov',
    kind: 'QuickTime movie',
    bytes: 12_400_000_000,
    folder: 'Films',
  },
  {
    id: 'podcast',
    name: 'Podcast Ep 42.wav',
    kind: 'WAVE audio',
    bytes: 1_100_000_000,
    folder: 'Client Work',
  },
  {
    id: 'budget',
    name: 'Budget.xlsx',
    kind: 'Spreadsheet',
    bytes: 1_363_968,
    folder: 'Client Work',
  },
  {
    id: 'pack',
    name: 'Sample Pack.zip',
    kind: 'ZIP archive',
    bytes: 3_600_000_000,
    folder: 'Client Work',
  },
  {
    id: 'invoice',
    name: 'Invoice.pdf',
    kind: 'PDF',
    bytes: 3_355_443,
    folder: 'Client Work',
  },
]

export function formatSize(bytes: number): string {
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB']
  let n = bytes
  let i = 0
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000
    i += 1
  }
  if (i === 0) return `${bytes} bytes`
  const digits = n >= 10 ? 1 : 1
  return `${n.toFixed(digits)} ${units[i]}`
}

export function diskBytes(keepOnMac: boolean, logical: number): number {
  return keepOnMac ? logical : 0
}

export function infoWhere(file: DriveFile): string {
  return `${driveRoot} › ${file.folder}`
}
