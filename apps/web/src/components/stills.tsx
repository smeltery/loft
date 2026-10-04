export type StillKind = 'wedding' | 'drone' | 'brand' | 'interview'

export function Still({ kind }: { kind: StillKind }) {
  return (
    <img
      className="f-still"
      src={`/thumbs/${kind}.webp`}
      alt=""
      loading="lazy"
    />
  )
}

export function Face({ i }: { i: number }) {
  const hues = [28, 36, 18, 42, 22]
  const hair = ['#1a1410', '#2c2018', '#3a2a1c', '#111', '#241c16']
  const h = hues[i % hues.length] ?? 28
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill={`hsl(${h} 22% 80%)`} />
      <ellipse cx="16" cy="15" rx="7.2" ry="8.2" fill={`hsl(${h} 32% 64%)`} />
      <path d="M7.5 13.5 Q16 1.5 24.5 13.5" fill={hair[i % hair.length]} />
      <circle cx="13" cy="15.5" r="1.05" fill="#1d1d1f" />
      <circle cx="19" cy="15.5" r="1.05" fill="#1d1d1f" />
    </svg>
  )
}
