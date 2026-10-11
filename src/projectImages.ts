/// <reference types="vite/client" />

import type { ProjectAlbum, ProjectGroup, ProjectImageRef } from './projectStructure'

const fullModules = import.meta.glob('./assets/projects/*/*/*/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const thumbModules = import.meta.glob('./assets/project-thumbs/*/*/*/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const FULL_PREFIX = './assets/projects/'
const THUMB_PREFIX = './assets/project-thumbs/'

const toKey = (path: string, prefix: string) =>
  path.slice(prefix.length).replace(/\.webp$/, '')

export type ProjectImageUrls = {
  full: string
  thumb: string
}

export const PROJECT_IMAGE_URLS: Record<string, ProjectImageUrls> = Object.entries(
  fullModules,
).reduce<Record<string, ProjectImageUrls>>((acc, [path, full]) => {
  const key = toKey(path, FULL_PREFIX)
  acc[key] = {
    full,
    thumb: thumbModules[`${THUMB_PREFIX}${key}.webp`] ?? full,
  }
  return acc
}, {})

export type ProjectGalleryImage = {
  image: string
  full?: string
  text: string
}

export function resolveProjectImages(
  refs: ProjectImageRef[],
): ProjectGalleryImage[] {
  return refs.map((ref) => {
    const urls = PROJECT_IMAGE_URLS[ref.src]
    return {
      image: urls?.thumb ?? urls?.full ?? '',
      full: urls?.full,
      text: ref.name,
    }
  })
}

export function groupCover(group: ProjectGroup): string {
  const first = group.images[0]
  if (!first) return ''
  const urls = PROJECT_IMAGE_URLS[first.src]
  return urls?.thumb ?? urls?.full ?? ''
}

export function albumCover(album: ProjectAlbum): string {
  const render = album.groups.find((group) => group.title.includes('效果图'))
  const group = render ?? album.groups[0]
  return group ? groupCover(group) : ''
}
