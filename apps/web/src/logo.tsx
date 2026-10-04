export function Logo({
  className,
  width,
  height,
}: {
  className?: string
  width?: number
  height?: number
}) {
  return (
    <img
      className={className ?? 'logo'}
      src="/brand/logo.svg"
      width={width ?? 24}
      height={height ?? 18}
      alt=""
    />
  )
}
