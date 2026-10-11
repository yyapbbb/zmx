import { PROJECT_FOLDERS } from './projectStructure'
import { albumCover } from './projectImages'
import { projectCoverUrl } from './projectCovers'

export type ProjectDetail = {
  id: string
  path: string
  title: string
  eyebrow: string
  description: string
}

const PROJECT_META: Record<string, { eyebrow: string; description: string }> = {
  'plan-to-build': {
    eyebrow: '01 / PLAN TO BUILD',
    description: '从平面方案到现场落地，记录完整的实现过程。',
  },
  'build-completed': {
    eyebrow: '02 / BUILT',
    description: '落地完成后的实景状态与空间细节。',
  },
  'plan-to-render': {
    eyebrow: '03 / RENDER',
    description: '从平面推敲到效果图呈现的完整表达。',
  },
  'plan-optimize': {
    eyebrow: '04 / PLAN',
    description: '针对户型问题重新梳理动线与功能分区。',
  },
}

export const PROJECT_DETAILS: ProjectDetail[] = PROJECT_FOLDERS.map(
  (folder, index) => ({
    id: folder.id,
    path: `/projects/${folder.id}`,
    title: folder.title,
    eyebrow:
      PROJECT_META[folder.id]?.eyebrow ??
      `${String(index + 1).padStart(2, '0')} / PROJECT`,
    description: PROJECT_META[folder.id]?.description ?? '',
  }),
)

export const PROJECT_FOLDER_BY_ID = PROJECT_FOLDERS.reduce<
  Record<string, (typeof PROJECT_FOLDERS)[number]>
>((acc, folder) => {
  acc[folder.id] = folder
  return acc
}, {})

export const PROJECT_ACCORDION_ITEMS = PROJECT_FOLDERS.map((folder) => ({
  image: projectCoverUrl(
    folder.id,
    albumCover(folder.albums[0] ?? { title: '', groups: [] }),
  ),
  label: folder.title,
  link: undefined,
}))
