import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import HorizontalGallery from './HorizontalGallery'
import ImageDetailPage from './ImageDetailPage'
import { albumCover, groupCover, resolveProjectImages } from './projectImages'
import { projectAlbumCoverUrl } from './projectAlbumCovers'
import { PROJECT_DETAILS, PROJECT_FOLDER_BY_ID } from './projectDetails'

type ProjectDetailPageProps = {
  path: string
  onBack: () => void
}

export default function ProjectDetailPage({
  path,
  onBack,
}: ProjectDetailPageProps) {
  const [albumIndex, setAlbumIndex] = useState<number | null>(null)
  const [groupIndex, setGroupIndex] = useState<number | null>(null)

  const detail = PROJECT_DETAILS.find((item) => item.path === path) ?? null
  const projectId = detail?.id ?? ''
  const albums = PROJECT_FOLDER_BY_ID[projectId]?.albums ?? []
  const album = albumIndex === null ? null : albums[albumIndex] ?? null
  const hasGroupLevel = (album?.groups.length ?? 0) > 1
  const group = album
    ? album.groups[hasGroupLevel ? groupIndex ?? -1 : 0] ?? null
    : null

  const albumItems = useMemo(
    () =>
      albums.map((entry, index) => ({
        image: projectAlbumCoverUrl(projectId, index, albumCover(entry)),
        text: entry.title,
      })),
    [albums, projectId],
  )

  const groupItems = useMemo(
    () =>
      (album?.groups ?? []).map((entry) => ({
        image: groupCover(entry),
        text: entry.title,
      })),
    [album],
  )

  const groupImages = useMemo(
    () => (group ? resolveProjectImages(group.images) : []),
    [group],
  )

  if (!detail) return null

  if (album && group) {
    return (
      <ImageDetailPage
        images={groupImages}
        aspectRatio={1}
        onBack={() => {
          if (hasGroupLevel) {
            setGroupIndex(null)
          } else {
            setAlbumIndex(null)
          }
        }}
      />
    )
  }

  const showGroups = album !== null
  const items = showGroups ? groupItems : albumItems

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-[#080908]">
      <div className="absolute inset-0 z-0">
        <HorizontalGallery
          items={items}
          onImageClick={(index) => {
            if (showGroups) {
              setGroupIndex(index)
            } else {
              setAlbumIndex(index)
            }
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-black/10 to-black/10" />
      <div className="pointer-events-none absolute bottom-6 left-5 z-10 sm:left-10 md:left-16">
        <button
          aria-label={showGroups ? '返回项目列表' : '返回项目'}
          onClick={() => (showGroups ? setAlbumIndex(null) : onBack())}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
      </div>
    </main>
  )
}
