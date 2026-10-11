import { useMemo } from 'react'
import ImageDetailPage from './ImageDetailPage'
import { WORK_IMAGES } from './workImages'
import type { WorkDetail } from './workDetails'

type WorkDetailPageProps = {
  detail: WorkDetail
  onBack: () => void
}

export default function WorkDetailPage({ detail, onBack }: WorkDetailPageProps) {
  const galleryItems = useMemo(
    () =>
      (WORK_IMAGES[detail.id] ?? []).map((item) => ({
        image: item.thumb,
        full: item.full,
        text: item.name,
      })),
    [detail],
  )

  return (
    <ImageDetailPage
      images={galleryItems}
      aspectRatio={1}
      onBack={onBack}
    />
  )
}