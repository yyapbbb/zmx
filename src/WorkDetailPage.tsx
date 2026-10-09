import { useMemo } from 'react'
import ImageDetailPage from './ImageDetailPage'
import { LIFE_WALL_ITEMS } from './lifeImages'
import type { WorkDetail } from './workDetails'

type WorkDetailPageProps = {
  detail: WorkDetail
  onBack: () => void
}

const MASONRY_HEIGHTS = [400, 250, 600, 320, 500, 360]

export default function WorkDetailPage({ detail, onBack }: WorkDetailPageProps) {
  const galleryItems = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const source =
          LIFE_WALL_ITEMS[(detail.imageStart + index) % LIFE_WALL_ITEMS.length]
        return {
          image: source.image,
          text: `${detail.title} ${String(index + 1).padStart(2, '0')}`,
        }
      }),
    [detail],
  )

  return (
    <ImageDetailPage
      images={galleryItems}
      masonryHeights={MASONRY_HEIGHTS}
      onBack={onBack}
    />
  )
}
