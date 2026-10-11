/// <reference types="vite/client" />

const albumCoverModules = import.meta.glob(
  './assets/project-album-covers/*/*.webp',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>

const ALBUM_COVER_PREFIX = './assets/project-album-covers/'

export const PROJECT_ALBUM_COVERS: Record<string, string> = Object.entries(
  albumCoverModules,
).reduce<Record<string, string>>((acc, [path, url]) => {
  acc[path.slice(ALBUM_COVER_PREFIX.length).replace(/\.webp$/, '')] = url
  return acc
}, {})

export function projectAlbumCoverUrl(
  folderId: string,
  albumIndex: number,
  fallback: string,
): string {
  const slug = String(albumIndex + 1).padStart(2, '0')
  return PROJECT_ALBUM_COVERS[`${folderId}/${slug}`] ?? fallback
}
