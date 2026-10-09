export type WorkDetail = {
  id: string
  path: string
  title: string
  eyebrow: string
  description: string
  imageStart: number
}

export const WORK_DETAILS: WorkDetail[] = [
  {
    id: 'plane-layout',
    path: '/work/plane-layout',
    title: '平面布局',
    eyebrow: '01 / PLAN',
    description: '梳理动线与尺度，建立适合生活方式的平面秩序。',
    imageStart: 0,
  },
  {
    id: '3d-study',
    path: '/work/3d-study',
    title: '三维空间推敲',
    eyebrow: '02 / SPACE',
    description: '在三维中反复推敲体块、视线与空间关系。',
    imageStart: 6,
  },
  {
    id: 'render',
    path: '/work/render',
    title: '效果图渲染',
    eyebrow: '03 / RENDER',
    description: '以材质、光线和场景氛围呈现最终空间想象。',
    imageStart: 12,
  },
  {
    id: 'cad',
    path: '/work/cad',
    title: '施工图绘制',
    eyebrow: '04 / DRAWING',
    description: '将设计意图转化为准确、可落地的施工依据。',
    imageStart: 18,
  },
  {
    id: 'materials',
    path: '/work/materials',
    title: '主材/软装清单',
    eyebrow: '05 / MATERIAL',
    description: '精选主材与软装，让材质、色彩和预算保持统一。',
    imageStart: 24,
  },
  {
    id: 'completed',
    path: '/work/completed',
    title: '完工照片',
    eyebrow: '06 / COMPLETED',
    description: '记录项目完成后的空间状态与实际使用效果。',
    imageStart: 30,
  },
]

export const WORK_ITEMS = WORK_DETAILS.map((item) => item.title)
