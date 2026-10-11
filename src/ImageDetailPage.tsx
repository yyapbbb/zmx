import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Masonry from './Masonry'

type ImageDetailPageProps = {
  images: { image: string; full?: string; text: string }[]
  masonryHeights?: number[]
  aspectRatio?: number
  onBack: () => void
}

export default function ImageDetailPage({
  images,
  masonryHeights,
  aspectRatio = 4 / 3,
  onBack,
}: ImageDetailPageProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const items = useMemo(
    () =>
      images.map((item, index) => ({
        id: `masonry-${index}`,
        img: item.image,
        url: '#',
        height: masonryHeights?.[index] ?? 300 + (index % 3) * 40,
      })),
    [images, masonryHeights],
  )

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-[#080908]">
      <div className="absolute inset-x-0 bottom-0 top-24 z-0 overflow-y-auto overflow-x-hidden">
        <Masonry
          items={items}
          autoHeight
          animateFrom="bottom"
          blurToFocus
          stagger={0.06}
          scaleOnHover
          hoverScale={0.95}
          aspectRatio={masonryHeights ? undefined : aspectRatio}
          onItemClick={(item) => {
            const index = Number(String((item as { id?: string }).id ?? '').replace('masonry-', ''))
            setActiveIndex(Number.isFinite(index) ? index : 0)
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/10 to-black/10" />
      <div className="pointer-events-none absolute bottom-6 left-5 z-10 sm:left-10 md:left-16">
        <button
          aria-label="返回画廊"
          onClick={onBack}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
      </div>
      {activeIndex !== null &&
        createPortal(
          <div className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-5">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="pointer-events-auto absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveIndex(
                (activeIndex - 1 + images.length) % images.length,
              )
            }
            className="pointer-events-auto absolute left-5 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label="上一张"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-12 sm:px-20">
            <img
              src={images[activeIndex].full ?? images[activeIndex].image}
              alt={images[activeIndex].text}
              className="block max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <p className="text-center text-sm font-medium text-white/80">
              {images[activeIndex].text}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setActiveIndex((activeIndex + 1) % images.length)
            }
            className="pointer-events-auto absolute right-5 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label="下一张"
          >
            <ArrowRight size={20} />
          </button>
          </div>,
          document.body,
        )}
    </main>
  )
}