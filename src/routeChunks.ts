export const loadSectionPage = () => import('./SectionPage')
export const loadDetailPage = () => import('./DetailPage')
export const loadProjectDetailPage = () => import('./ProjectDetailPage')
export const loadWorkDetailPage = () => import('./WorkDetailPage')
export const loadImageDetailPage = () => import('./ImageDetailPage')
export const loadMasonry = () => import('./Masonry')
export const loadHorizontalGallery = () => import('./HorizontalGallery')
export const loadProjectAccordion = () => import('./ProjectAccordion')
export const loadLanyard = () => import('./Lanyard')
export const loadDriftWall = () => import('./DriftWall')
export const loadProfileCard = () => import('./ProfileCard')

export function prefetchRoute(path: string, deep = true): void {
  if (path.startsWith('/projects/')) {
    void loadProjectDetailPage()
    void loadImageDetailPage()
    return
  }
  if (path.startsWith('/work/')) {
    void loadWorkDetailPage()
    void loadImageDetailPage()
    return
  }
  if (path.startsWith('/site/')) {
    void loadDetailPage()
    return
  }
  void loadSectionPage()
  if (!deep) return
  if (path === '/about') {
    void loadLanyard()
  }
  if (path === '/life') {
    void loadDriftWall()
  }
  if (path === '/contact') {
    void loadProfileCard()
  }
  if (path === '/projects') {
    void loadProjectAccordion()
  }
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
}

export function prefetchWhenIdle(task: () => void, timeout = 1500): void {
  const w = window as IdleWindow
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(task, { timeout })
    return
  }
  window.setTimeout(task, timeout)
}
