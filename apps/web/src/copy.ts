export const site = {
  name: 'loft',
  tagline: 'more space for your mac',
  headline: 'meet loft.',
  lede: 'more space for your mac, without buying a new one.',
  download: 'Download macOS 26+',
  downloadHref: 'https://github.com/smeltery/loft/releases/latest',
}

import { catalog, formatSize } from '@loft/core'

export const files = catalog.map((file) => ({
  name: file.name,
  size: formatSize(file.bytes),
  kind: file.kind,
}))

export const notes: {
  n: string
  title: string
  lead?: string
  paras?: string[]
  facts?: boolean
  steps?: string[]
  perks?: boolean
}[] = [
  {
    n: '1',
    title: 'what it is',
    lead: 'a new drive in finder, with terabytes of space.',
    paras: [
      'it sits right next to macintosh hd. your files look and open like normal, in the apps you already use.',
      'but they live in the cloud, so a 50 GB film takes no space on your mac.',
    ],
  },
  {
    n: '2',
    title: 'why it’s different',
    paras: [
      'icloud and dropbox download the whole file before you can open it. then it stays and fills up your mac.',
      'loft only grabs the part you’re watching. hit play on a huge video and it starts right away.',
    ],
    facts: true,
  },
  {
    n: '3',
    title: 'how it works',
    steps: [
      'install loft. it lives in your menu bar.',
      'open the loft drive in finder.',
      'drag in your biggest files. done.',
    ],
  },
  {
    n: '4',
    title: 'what you get',
    perks: true,
  },
]

export const stats = [
  { value: '0 bytes', label: 'used on your mac' },
  { value: '0.8 s', label: 'to start playing' },
  { value: '30 TB', label: 'of space, if you need it' },
] as const

export const perks = [
  'share any file with a link',
  'get files from anyone with a link',
  'undo a delete for 30 days',
  'keep folders on your mac to work offline',
  'find any file with ⌃⌥O',
  'drop files on the menu bar icon',
  'uploads that don’t slow your internet',
  'big uploads pick up after wi-fi drops',
  'edit on two macs without losing work',
] as const

export const stories = [
  {
    kicker: 'add your files',
    title: 'just drag them onto loft in your menu bar.',
  },
  {
    kicker: 'free up your mac',
    title: 'your files live in loft, so your mac has room again.',
  },
  {
    kicker: 'watch right away',
    title: 'big videos start playing in a second. no waiting.',
  },
  {
    kicker: 'use files without wi-fi',
    title: 'right-click a folder to keep it on your mac.',
  },
  {
    kicker: 'share a link',
    title: 'right-click, copy the link, send it. that’s all.',
  },
  {
    kicker: 'get files from anyone',
    title: 'send a link, and their files go straight to you.',
  },
] as const

export type CmpValue = true | false | 'partly'

export const compare = {
  columns: ['loft', 'icloud', 'google drive', 'dropbox'] as const,
  rows: [
    {
      label: 'opens big files without downloading them first',
      values: [true, false, true, false] as const satisfies readonly CmpValue[],
    },
    {
      label: 'watching a film doesn’t fill up your mac',
      values: [
        true,
        false,
        'partly',
        false,
      ] as const satisfies readonly CmpValue[],
    },
    {
      label: 'made just for the mac, as a real drive in finder',
      values: [
        true,
        false,
        false,
        false,
      ] as const satisfies readonly CmpValue[],
    },
  ],
}

export const faqs = [
  {
    q: 'what is loft?',
    a: 'a new drive in finder with terabytes of space. your files look and open like normal, but they live in the cloud, so they take no space on your mac.',
  },
  {
    q: 'how can a file open instantly if it isn’t on my mac?',
    a: 'loft only grabs the part your app needs, right when it needs it. a video starts as soon as the first seconds arrive. skip ahead, and it grabs just that part.',
  },
  {
    q: 'how is loft different from icloud drive, dropbox or google drive?',
    a: 'icloud and dropbox download the whole file before you can open it, and then it takes up space on your mac. loft only grabs the part you use, so big files open fast and your mac stays free. google drive can stream too, but loft is made just for the mac.',
  },
  {
    q: 'will it work with my apps?',
    a: 'yes. final cut pro, premiere pro, photoshop, quicktime and preview all see loft as a normal drive. nothing extra to install.',
  },
  {
    q: 'do i need an internet connection?',
    a: 'for most files, yes. to work offline, right-click a folder and choose keep on this mac. new files you add wait on your mac and upload when you’re back online.',
  },
  {
    q: 'how does loft protect my files?',
    a: 'your files live in your own cloud bucket, encrypted in transit, and always sent over a secure connection. deleted files stay for 30 days, and edits on two macs never overwrite each other.',
  },
  {
    q: 'is loft really free?',
    a: 'yes. loft is free and open source. you run it yourself and only pay your cloud provider for the storage you use.',
  },
  {
    q: 'what are the system requirements?',
    a: 'a mac with macOS 26 tahoe or newer. loft uses apple’s newest drive technology, which arrived in macOS 26.',
  },
] as const
