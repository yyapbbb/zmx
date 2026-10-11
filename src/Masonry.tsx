// @ts-nocheck
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

import './Masonry.css'

const useMedia = (queries, values, defaultValue) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue
    return values[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue
  }

  const [value, setValue] = useState(get)

  useEffect(() => {
    const handler = () => setValue(get)
    queries.forEach((q) => matchMedia(q).addEventListener('change', handler))
    return () => queries.forEach((q) => matchMedia(q).removeEventListener('change', handler))
  }, [queries])

  return value
}

const useMeasure = () => {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height },
      )
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return [ref, size]
}

const findScrollParent = (node) => {
  let el = node?.parentElement ?? null
  while (el && el !== document.body) {
    const style = getComputedStyle(el)
    if (/(auto|scroll|overlay)/.test(style.overflowY)) return el
    el = el.parentElement
  }
  return null
}

type MasonryProps = {
  items?: {
    id: string
    img: string
    url?: string
    height?: number
  }[]
  ease?: string
  duration?: number
  stagger?: number
  animateFrom?: string
  scaleOnHover?: boolean
  hoverScale?: number
  blurToFocus?: boolean
  colorShiftOnHover?: boolean
  aspectRatio?: number
  autoHeight?: boolean
  eagerCount?: number
  onItemClick?: (item: unknown) => void
}

function Masonry({
  items = [],
  ease = 'power2.out',
  duration = 0.45,
  stagger = 0.045,
  scaleOnHover = true,
  hoverScale = 0.95,
  colorShiftOnHover = false,
  aspectRatio,
  autoHeight = false,
  eagerCount = 10,
  onItemClick,
}: MasonryProps) {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    2,
  )

  const [containerRef, { width }] = useMeasure()
  const itemRefs = useRef(new Map())

  const setItemRef = useCallback((id, el) => {
    if (el) itemRefs.current.set(id, el)
    else itemRefs.current.delete(id)
  }, [])

  const grid = useMemo(() => {
    if (!width) return []

    const colHeights = new Array(columns).fill(0)
    const columnWidth = width / columns

    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights))
      const x = columnWidth * col
      const height = aspectRatio ? columnWidth / aspectRatio : (child.height || 300) / 2
      const y = colHeights[col]

      colHeights[col] += height

      return { ...child, x, y, w: columnWidth, h: height }
    })
  }, [columns, items, width, aspectRatio])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (!grid.length) return

    grid.forEach((item) => {
      const el = itemRefs.current.get(item.id)
      if (!el) return
      el.style.width = `${item.w}px`
      el.style.height = `${item.h}px`
      gsap.set(el, { x: item.x, y: item.y, force3D: true })
    })

    if (!autoHeight) {
      container.style.height = ''
      return
    }
    const total = grid.reduce((max, item) => Math.max(max, item.y + item.h), 0)
    container.style.height = total ? `${Math.ceil(total)}px` : '100%'
  }, [grid, autoHeight, containerRef])

  useEffect(() => {
    const ready = [...itemRefs.current.values()]
    if (!ready.length) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      ready.forEach((el) => {
        const inner = el.firstElementChild
        if (inner) gsap.set(inner, { autoAlpha: 1, y: 0 })
      })
      return
    }

    const root = findScrollParent(containerRef.current)
    const observer = new IntersectionObserver(
      (entries) => {
        const batch = entries.filter((entry) => entry.isIntersecting)
        batch.forEach((entry, index) => {
          const inner = entry.target.firstElementChild
          observer.unobserve(entry.target)
          if (!inner) return
          gsap.to(inner, {
            autoAlpha: 1,
            y: 0,
            duration,
            ease,
            delay: Math.min(index, 5) * stagger,
            overwrite: 'auto',
          })
        })
      },
      { root, rootMargin: '420px 0px', threshold: 0.01 },
    )

    ready.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [grid.length, items, containerRef, duration, ease, stagger])

  useEffect(
    () => () => {
      itemRefs.current.forEach((el) => {
        gsap.killTweensOf(el)
        const inner = el.firstElementChild
        if (inner) gsap.killTweensOf(inner)
      })
    },
    [],
  )

  const handleMouseEnter = useCallback(
    (event) => {
      if (!scaleOnHover) return
      const inner = event.currentTarget.firstElementChild
      if (!inner) return
      gsap.to(inner, { scale: hoverScale, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      if (colorShiftOnHover) {
        const overlay = inner.querySelector('.color-overlay')
        if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 })
      }
    },
    [scaleOnHover, hoverScale, colorShiftOnHover],
  )

  const handleMouseLeave = useCallback(
    (event) => {
      const inner = event.currentTarget.firstElementChild
      if (!inner) return
      if (scaleOnHover) {
        gsap.to(inner, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      }
      if (colorShiftOnHover) {
        const overlay = inner.querySelector('.color-overlay')
        if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 })
      }
    },
    [scaleOnHover, colorShiftOnHover],
  )

  return (
    <div ref={containerRef} className="list">
      {grid.map((item, index) => (
        <div
          key={item.id}
          data-key={item.id}
          ref={(el) => setItemRef(item.id, el)}
          className="item-wrapper"
          onClick={() => {
            if (onItemClick) onItemClick(item)
            else if (item.url) window.open(item.url, '_blank', 'noopener')
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="item-img">
            <img
              src={item.img}
              alt=""
              draggable={false}
              loading={index < eagerCount ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index < 3 ? 'high' : 'auto'}
            />
            {colorShiftOnHover && <div className="color-overlay" />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Masonry
