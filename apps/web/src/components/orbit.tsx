import { useLayoutEffect, useRef } from 'react'
import { DocIcon, FolderIcon } from './finder/finder-icons'
import { Still } from './stills'

const CFG = {
  cy: 0.56,
  ry: 0.2,
  extra: 40,
  extraPhone: 12,
  tilt: (-6 * Math.PI) / 180,
  secondsPerTurn: 48,
}

export function Orbit() {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const orbs = [...root.querySelectorAll<HTMLElement>('.orb')]
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const place = (t: number) => {
      const w = root.clientWidth
      const h = root.clientHeight
      const rx = w / 2 + (w < 800 ? CFG.extraPhone : CFG.extra)
      const ry = h * CFG.ry
      const spin = reduce ? 0 : (t / 1000 / CFG.secondsPerTurn) * Math.PI * 2
      orbs.forEach((orb, i) => {
        const a = spin + (i / orbs.length) * Math.PI * 2 + 0.4
        const x = Math.cos(a) * rx
        const y = Math.sin(a) * ry
        const px = w / 2 + x * Math.cos(CFG.tilt) - y * Math.sin(CFG.tilt)
        const py = h * CFG.cy + x * Math.sin(CFG.tilt) + y * Math.cos(CFG.tilt)
        const front = Math.sin(a) > 0 && w >= 800
        const scale = 0.8 + ((Math.sin(a) + 1) / 2) * 0.2
        orb.style.transform = `translate(${px}px, ${py}px) scale(${scale})`
        orb.style.zIndex = front ? '2' : '-1'
      })
    }
    const tick = (t: number) => {
      place(t)
      if (!reduce) raf = requestAnimationFrame(tick)
    }
    place(0)
    raf = requestAnimationFrame(tick)
    const onResize = () => place(performance.now())
    addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', onResize)
    }
  }, [])
  return (
    <div className="orbit" ref={ref} aria-hidden="true">
      <span className="orbit-ring" />
      <span className="orb">
        <Still kind="wedding" />
      </span>
      <span className="orb">
        <FolderIcon />
      </span>
      <span className="orb">
        <DocIcon label="PSD" />
      </span>
      <span className="orb">
        <Still kind="drone" />
      </span>
      <span className="orb">
        <DocIcon label="WAV" />
      </span>
    </div>
  )
}
