/// <reference types="vite/client" />

const coverModules = import.meta.glob('./assets/project-covers/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const COVER_PREFIX = './assets/project-covers/'

export const PROJECT_COVERS: Record<string, string> = Object.entries(
  coverModules,
).reduce<Record<string, string>>((acc, [path, url]) => {
  acc[path.slice(COVER_PREFIX.length).replace(/\.webp$/, '')] = url
  return acc
}, {})

export function projectCoverUrl(id: string, fallback: string): string {
  return PROJECT_COVERS[id] ?? fallback
}
