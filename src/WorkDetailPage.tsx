import { useMemo } from 'react'
import ImageDetailPage from './ImageDetailPage'
import { WORK_IMAGES } from './workImages'
import type { WorkDetail } from './workDetails'

type WorkDetailPageProps = {
  detail: WorkDetail
  onBack: () => void
}

const MASONRY_HEIGHTS = [420, 280, 560, 340, 500, 300, 460, 360]

export default function WorkDetailPage({ detail, onBack }: WorkDetailPageProps) {
  const galleryItems = useMemo(() => {
    const images = WORK_IMAGES[detail.id] ?? []

    return images.map((item, index) => ({
      image: item.thumb,
      full: item.full,
      text: `${detail.title} ${String(index + 1).padStart(2, '0')}`,
    }))
  }, [detail])

  const masonryHeights = useMemo(
    () =>
      galleryItems.map(
        (_, index) => MASONRY_HEIGHTS[index % MASONRY_HEIGHTS.length],
      ),
    [galleryItems],
  )

  return (
    <ImageDetailPage
      images={galleryItems}
      masonryHeights={masonryHeights}
      onBack={onBack}
    />
  )
}