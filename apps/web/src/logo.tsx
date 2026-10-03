export function Logo({ className }: { className?: string }) {
  return (
    <img
      className={className ?? 'logo'}
      src="/brand/logo.png"
      width={24}
      height={18}
      alt=""
    />
  )
}
