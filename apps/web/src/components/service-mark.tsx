const serviceIcons = {
  icloud: 'icloud',
  dropbox: 'dropbox',
  'google drive': 'googledrive',
} as const

export function ServiceMark({
  name,
  size = 22,
}: {
  name: keyof typeof serviceIcons
  size?: number
}) {
  return (
    <img
      src={`/brands/${serviceIcons[name]}.svg`}
      alt=""
      width={size}
      height={size}
    />
  )
}
