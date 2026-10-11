/// <reference types="vite/client" />

const fullModules = import.meta.glob('./assets/work/*/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const thumbModules = import.meta.glob('./assets/work-thumbs/*/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export type WorkImage = {
  full: string
  thumb: string
  name: string
}

export const WORK_IMAGES: Record<string, WorkImage[]> = Object.entries(
  fullModules,
)
  .sort(([a], [b]) => a.localeCompare(b, 'zh-CN', { numeric: true }))
  .reduce<Record<string, WorkImage[]>>((acc, [path, full]) => {
    const rel = path.replace('./assets/work/', '')
    const id = rel.split('/')[0]
    const file = rel.split('/').slice(1).join('/')
    const thumb = thumbModules[`./assets/work-thumbs/${rel}`] ?? full
    const name = file.replace(/\.[^.]+$/, '')

    acc[id] = acc[id] ?? []
    acc[id].push({ full, thumb, name })
    return acc
  }, {})