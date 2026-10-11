import { useEffect, useRef } from 'react'

const SPOTLIGHT_R = 260

type RevealLayerProps = {
  image: string
  radius?: number
}

export default function RevealLayer({
  image,
  radius = SPOTLIGHT_R,
}: RevealLayerProps) {
  const revealRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = revealRef.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.42 }
    const pos = { x: target.x, y: target.y }
    let raf: number | null = null

    const apply = () => {
      el.style.setProperty('--spot-x', `${pos.x.toFixed(1)}px`)
      el.style.setProperty('--spot-y', `${pos.y.toFixed(1)}px`)
    }

    el.style.setProperty('--spot-r', `${radius}px`)
    apply()

    if (reduced) {
      el.style.setProperty('--spot-x', '50%')
      el.style.setProperty('--spot-y', '42%')
      return
    }

    const loop = () => {
      const dx = target.x - pos.x
      const dy = target.y - pos.y

      if (Math.abs(dx) < 0.35 && Math.abs(dy) < 0.35) {
        pos.x = target.x
        pos.y = target.y
        apply()
        raf = null
        return
      }

      pos.x += dx * 0.14
      pos.y += dy * 0.14
      apply()
      raf = window.requestAnimationFrame(loop)
    }

    const kick = () => {
      if (raf === null) raf = window.requestAnimationFrame(loop)
    }

    const handlePointerMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      kick()
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (raf !== null) window.cancelAnimationFrame(raf)
      raf = null
    }
  }, [radius])

  return (
    <div
      ref={revealRef}
      className="reveal-layer"
      style={{ backgroundImage: `url(${image})` }}
    />
  )
}
