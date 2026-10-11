import { LIFE_WALL_ITEMS } from './lifeImages'

export type ProjectDetail = {
  id: string
  path: string
  title: string
  eyebrow: string
  description: string
  imageStart: number
}

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    id: 'residence',
    path: '/projects/residence',
    title: '从平面到落地',
    eyebrow: '01 / PLAN TO BUILD',
    description: '从平面方案到现场落地，记录完整的实现过程。',
    imageStart: 0,
  },
  {
    id: 'commercial',
    path: '/projects/commercial',
    title: '从平面到落地完工',
    eyebrow: '02 / BUILT',
    description: '落地完成后的实景状态与空间细节。',
    imageStart: 6,
  },
  {
    id: 'cultural',
    path: '/projects/cultural',
    title: '从平面到效果图',
    eyebrow: '03 / RENDER',
    description: '从平面推敲到效果图呈现的完整表达。',
    imageStart: 12,
  },
  {
    id: 'retail',
    path: '/projects/retail',
    title: '平面户型优化',
    eyebrow: '04 / PLAN',
    description: '针对户型问题重新梳理动线与功能分区。',
    imageStart: 18,
  },
]

export const PROJECT_ACCORDION_ITEMS = PROJECT_DETAILS.map((item, index) => ({
  image: LIFE_WALL_ITEMS[(item.imageStart + index) % LIFE_WALL_ITEMS.length].image,
  label: item.title,
  link: undefined,
}))