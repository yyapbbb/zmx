import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

import './HorizontalGallery.css'

type HorizontalGalleryItem = {
  image: string
  text: string
}

type HorizontalGalleryProps = {
  items: HorizontalGalleryItem[]
  stateKey?: string
  onImageClick?: (index: number, item: HorizontalGalleryItem) => void
}

export default function HorizontalGallery({
  items,
  stateKey,
  onImageClick,
}: HorizontalGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    moved: false,
    captured: false,
  })
  const suppressClickRef = useRef(false)
  const suppressTimerRef = useRef<number | null>(null)
  const [canGoPrevious, setCanGoPrevious] = useState(false)
  const [canGoNext, setCanGoNext] = useState(false)
  const storageKey = stateKey ? `zmx-gallery-scroll:${stateKey}` : null

  const updateControls = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth)
    setCanGoPrevious(track.scrollLeft > 4)
    setCanGoNext(track.scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const handleWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY
      if (!delta) return
      event.preventDefault()
      track.scrollLeft += delta
    }

    track.addEventListener('wheel', handleWheel, { passive: false })
    return () => track.removeEventListener('wheel', handleWheel)
  }, [])

  useEffect(
    () => () => {
      if (suppressTimerRef.current !== null) {
        window.clearTimeout(suppressTimerRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    updateControls()
    track.addEventListener('scroll', updateControls, { passive: true })
    const resizeObserver = new ResizeObserver(updateControls)
    resizeObserver.observe(track)

    return () => {
      track.removeEventListener('scroll', updateControls)
      resizeObserver.disconnect()
    }
  }, [updateControls])

  useEffect(() => {
    const track = trackRef.current
    if (!track || !storageKey) return

    let saved: number | null = null
    try {
      const raw = window.sessionStorage.getItem(storageKey)
      const parsed = raw === null ? Number.NaN : Number(raw)
      if (Number.isInteger(parsed) && parsed > 0) saved = parsed
    } catch {
      saved = null
    }

    if (saved === null) {
      updateControls()
      return
    }

    const savedIndex = saved
    const apply = () => {
      const card = track.children[savedIndex] as HTMLElement | undefined
      if (!card) {
        updateControls()
        return
      }
      const centered =
        card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth)
      track.scrollLeft = Math.max(0, Math.min(centered, maxScroll))
      updateControls()
    }

    apply()
    const frame = window.requestAnimationFrame(apply)
    return () => window.cancelAnimationFrame(frame)
  }, [storageKey, updateControls])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      const track = trackRef.current
      if (!track) return

      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startScroll: track.scrollLeft,
        moved: false,
        captured: false,
      }
    },
    [],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      const track = trackRef.current
      if (!drag.active || !track) return

      const deltaX = event.clientX - drag.startX
      if (Math.abs(deltaX) > 8) {
        drag.moved = true
        if (!drag.captured) {
          drag.captured = true
          track.setPointerCapture?.(event.pointerId)
        }
      }
      track.scrollLeft = drag.startScroll - deltaX
    },
    [],
  )

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      const track = trackRef.current
      if (!drag.active) return

      drag.active = false
      suppressClickRef.current = drag.moved
      if (drag.captured && track?.releasePointerCapture) {
        try {
          track.releasePointerCapture(event.pointerId)
        } catch {
          // The pointer may already have been released by the browser.
        }
      }

      if (suppressTimerRef.current !== null) {
        window.clearTimeout(suppressTimerRef.current)
      }
      suppressTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false
      }, 140)
      drag.captured = false
    },
    [],
  )

  const handleCardClick = useCallback(
    (index: number, item: HorizontalGalleryItem) => {
      if (suppressClickRef.current) return
      if (storageKey) {
        try {
          window.sessionStorage.setItem(storageKey, String(index))
        } catch {
          // Ignore storage failures (private mode, blocked storage).
        }
      }
      onImageClick?.(index, item)
    },
    [onImageClick, storageKey],
  )

  const moveByCard = useCallback((direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return

    const card = track.querySelector<HTMLElement>('.horizontal-gallery__card')
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0') || 0
    const step = (card?.getBoundingClientRect().width ?? track.clientWidth * 0.8) + gap
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }, [])

  return (
    <div className="horizontal-gallery-shell">
      <div
        ref={trackRef}
        className="horizontal-gallery"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="region"
        aria-label="横向项目图片画廊"
      >
        {items.map((item, index) => (
          <button
            key={`${item.text}-${index}`}
            type="button"
            className="horizontal-gallery__card"
            onClick={() => handleCardClick(index, item)}
            aria-label={item.text}
          >
            <span className="horizontal-gallery__media">
              <img
                src={item.image}
                alt={item.text}
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="horizontal-gallery__caption">{item.text}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="horizontal-gallery__control horizontal-gallery__control--previous"
        onClick={() => moveByCard(-1)}
        disabled={!canGoPrevious}
        aria-label="上一张"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        className="horizontal-gallery__control horizontal-gallery__control--next"
        onClick={() => moveByCard(1)}
        disabled={!canGoNext}
        aria-label="下一张"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  )
}
