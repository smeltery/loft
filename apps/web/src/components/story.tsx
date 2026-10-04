import { useEffect, useRef, useState } from 'react'
import FinderStage from './finder/finder-stage'
import './story.css'

export default function Story() {
  const ref = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      if (reduce) {
        setStep(3)
        return
      }
      const box = el.getBoundingClientRect()
      const span = box.height - innerHeight
      const p = span > 0 ? Math.min(1, Math.max(0, -box.top / span)) : 1
      setStep(p < 0.18 ? 0 : p < 0.42 ? 1 : p < 0.68 ? 2 : 3)
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <section
      ref={ref}
      className="story"
      data-step={step}
      aria-label="How loft looks in finder"
    >
      <div className="story-sticky wrap">
        <FinderStage step={step} />
      </div>
    </section>
  )
}
