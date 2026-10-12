import { useMemo } from 'react'
import HorizontalGallery from './HorizontalGallery'
import { PROJECT_ACCORDION_ITEMS } from './projectDetails'

type ProjectAccordionProps = {
  onImageClick?: (index: number) => void
}

export default function ProjectAccordion({
  onImageClick,
}: ProjectAccordionProps) {
  const items = useMemo(
    () =>
      PROJECT_ACCORDION_ITEMS.map((item) => ({
        image: item.image,
        text: item.label,
      })),
    [],
  )

  return (
    <HorizontalGallery
      items={items}
      stateKey="projects"
      onImageClick={onImageClick}
    />
  )
}
