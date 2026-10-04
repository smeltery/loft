import { useEffect, useRef } from 'react'

type Dot = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  vr: number
  c: string
}

const COLORS = ['#111', '#3a3a3c', '#6e6e73', '#8e8e93', '#c7c7cc']

export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dots: Dot[] = []
    let raf = 0
    const size = () => {
      const box = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(box.width * devicePixelRatio))
      canvas.height = Math.max(1, Math.floor(box.height * devicePixelRatio))
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }
    const seed = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      dots.length = 0
      for (let i = 0; i < (reduce ? 28 : 96); i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: 0.12 + Math.random() * 0.4,
          r: 1 + Math.random() * 2.4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.05,
          c: COLORS[i % COLORS.length] ?? '#111',
        })
      }
    }
    const tick = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        if (!reduce) {
          d.x += d.vx
          d.y += d.vy
          d.rot += d.vr
          if (d.y > h + 6) d.y = -6
          if (d.x < -6) d.x = w + 6
          if (d.x > w + 6) d.x = -6
        }
        ctx.save()
        ctx.translate(d.x, d.y)
        ctx.rotate(d.rot)
        ctx.fillStyle = d.c
        ctx.fillRect(-d.r, -d.r / 2, d.r * 2, d.r)
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    size()
    seed()
    tick()
    const ro = new ResizeObserver(() => {
      size()
      seed()
    })
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])
  return (
    <div className="confetti" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  )
}
