import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Menu, X } from 'lucide-react'
import RevealLayer from './RevealLayer'
import { BG_IMAGE_1, BG_IMAGE_2, SITES } from './strata'
import { PROJECT_ROUTE_PATHS, isProjectRoute } from './projectRoutes'
import { WORK_DETAILS } from './workDetails'
import {
  loadDetailPage,
  loadProjectDetailPage,
  loadSectionPage,
  loadWorkDetailPage,
  prefetchRoute,
  prefetchWhenIdle,
} from './routeChunks'
import logo from './assets/logo.jpg'

const SectionPage = lazy(loadSectionPage)
const ProjectDetailPage = lazy(loadProjectDetailPage)
const WorkDetailPage = lazy(loadWorkDetailPage)
const DetailPage = lazy(loadDetailPage)

const SPOTLIGHT_R = 260

gsap.registerPlugin(ScrollTrigger)

type NavItem = {
  label: string
  path: string
  eyebrow: string
  description: string
  image: string
  fallback: string
}

const NAV_ITEMS: NavItem[] = [
  {
    label: '工作',
    path: '/work',
    eyebrow: 'WORK',
    description: '个人工作流程，从策略、空间到细节落地的整体设计。',
    image: SITES[0].image,
    fallback: SITES[0].fallback,
  },
  {
    label: '项目',
    path: '/projects',
    eyebrow: 'PROJECTS',
    description: '精选住宅、商业与文化项目，呈现不同尺度下的空间可能。',
    image: SITES[1].image,
    fallback: SITES[1].fallback,
  },
  {
    label: '生活',
    path: '/life',
    eyebrow: 'LIFE',
    description: '关注日常中的光线和空间场域感受体验。',
    image: SITES[2].image,
    fallback: SITES[2].fallback,
  },
  {
    label: '关于',
    path: '/about',
    eyebrow: 'ABOUT',
    description: '钟美兴专注于打造个性化和有目的的空间。',
    image: SITES[3].image,
    fallback: SITES[3].fallback,
  },
  {
    label: '联系',
    path: '/contact',
    eyebrow: 'CONTACT',
    description: '欢迎交流新项目、合作与空间设计。',
    image: SITES[4].image,
    fallback: SITES[4].fallback,
  },
]

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  const openedOnce = useRef(false)
  const transitionTimers = useRef<number[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const transitionRef = useRef(false)
  const lastNextClickRef = useRef<{ to: string; time: number } | null>(null)
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash.replace(/^#/, '')
    return hash || '/'
  })

  const performNavigation = (to: string) => {
    setMobileOpen(false)
    if (to === route) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    if (transitionRef.current) return

    prefetchRoute(to)
    transitionRef.current = true
    setTransitioning(true)
    transitionTimers.current.push(
      window.setTimeout(() => {
        window.location.hash = to
        window.scrollTo({ top: 0, behavior: 'instant' })
        transitionTimers.current.push(
          window.setTimeout(() => {
            setTransitioning(false)
            transitionRef.current = false
          }, 140),
        )
      }, 90),
    )
  }

  const navigate = (to: string, requireDoubleClick = false) => {
    setMobileOpen(false)
    if (requireDoubleClick) {
      const now = performance.now()
      const lastClick = lastNextClickRef.current
      if (!lastClick || lastClick.to !== to || now - lastClick.time > 450) {
        lastNextClickRef.current = { to, time: now }
        return
      }
      lastNextClickRef.current = null
    }
    performNavigation(to)
  }

  const navigateNext = (to: string) => navigate(to, true)

  useEffect(
    () => () => {
      transitionTimers.current.forEach((id) => window.clearTimeout(id))
      transitionTimers.current = []
    },
    [],
  )

  useEffect(() => {
    prefetchWhenIdle(() => {
      void loadSectionPage()
      void loadDetailPage()
    }, 2000)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '')
      setRoute(hash || '/')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const activeSiteIndex = route.startsWith('/site/')
    ? SITES.findIndex((site) => site.id === route.replace('/site/', ''))
    : -1
  const activeSite = activeSiteIndex >= 0 ? SITES[activeSiteIndex] : null
  const activeProject = isProjectRoute(route)
  const activeWorkIndex = WORK_DETAILS.findIndex((item) => item.path === route)
  const activeWork = activeWorkIndex >= 0 ? WORK_DETAILS[activeWorkIndex] : null
  const activeNavIndex = NAV_ITEMS.findIndex((item) => item.path === route)
  const activeNav = activeNavIndex >= 0 ? NAV_ITEMS[activeNavIndex] : null

  useLayoutEffect(() => {
    if (activeProject || activeWork || activeSite || activeNav) {
      ScrollTrigger.refresh()
      return
    }

    const ctx = gsap.context(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reducedMotion) {
        gsap.set('.hero-intro-mask', { autoAlpha: 0 })
        gsap.set('.hero-line-inner, .hero-bg-zoom', { clearProps: 'all' })
        gsap.set('.site-nav, .hero-meta', { autoAlpha: 1, y: 0 })
        ScrollTrigger.refresh()
        return
      }

      if (!openedOnce.current) {
        openedOnce.current = true

        gsap.set('.hero-intro-mask', { clipPath: 'inset(0% 0% 0% 0%)' })
        gsap.set('.hero-line-inner', {
          yPercent: 130,
          scaleY: 1.35,
          skewY: 6,
          transformOrigin: '50% 100%',
        })
        gsap.set('.site-nav', { autoAlpha: 0, y: -26 })
        gsap.set('.hero-meta', { autoAlpha: 0, y: 30 })
        gsap.set('.hero-bg-zoom', { scale: 1.2 })

        const intro = gsap.timeline({
          defaults: { ease: 'power4.inOut' },
        })

        intro
          .to('.hero-intro-mask', {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 1.1,
          }, 0.15)
          .to('.hero-bg-zoom', {
            scale: 1,
            duration: 1.8,
            ease: 'power2.out',
          }, 0.2)
          .to('.hero-line-inner', {
            yPercent: 0,
            scaleY: 1,
            skewY: 0,
            duration: 1.3,
            ease: 'power4.out',
          }, 0.55)
          .to('.site-nav', {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
          }, 0.85)
          .to('.hero-meta', {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
          }, 1)
      } else {
        gsap.set('.hero-intro-mask', { autoAlpha: 0 })
        gsap.set('.hero-line-inner', { yPercent: 0, scaleY: 1, skewY: 0 })
        gsap.set('.hero-bg-zoom', { scale: 1 })
        gsap.set('.site-nav, .hero-meta', { autoAlpha: 1, y: 0 })
      }

      ScrollTrigger.refresh()
    }, rootRef)

    return () => ctx.revert()
  }, [activeSite, activeNavIndex])

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
        <div
          className={`route-fade pointer-events-none fixed inset-0 z-[300] bg-[#080908] transition-opacity duration-150 ${
            transitioning ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />
        <nav className="site-nav fixed left-0 right-0 top-0 z-[100] flex items-center justify-between p-4 sm:p-5">
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <img
              src={logo}
              alt="钟美兴"
              className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
            />
            <span className="font-playfair text-2xl text-white">钟美兴</span>
          </button>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2 py-2 backdrop-blur-md md:flex">
            {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => prefetchRoute(item.path)}
              onFocus={() => prefetchRoute(item.path)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/20 hover:text-white ${
                route === item.path ? 'bg-white/20 text-white' : 'text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md md:hidden"
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-2 bg-black/90 px-6 backdrop-blur-xl md:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 text-lg font-medium ${
                route === item.path ? 'text-white' : 'text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <Suspense fallback={<div className="min-h-screen w-full bg-[#080908]" />}>
      {activeProject ? (
        <ProjectDetailPage path={route} onBack={() => navigate('/projects')} />
      ) : activeWork ? (
        <WorkDetailPage detail={activeWork} onBack={() => navigate('/work')} />
      ) : activeSite ? (
        <DetailPage
          site={activeSite}
          index={activeSiteIndex}
          total={SITES.length}
          onBack={() => navigate('/')}
          onNext={() =>
            navigateNext(
              `/site/${SITES[(activeSiteIndex + 1) % SITES.length].id}`,
            )
          }
        />
      ) : activeNav ? (
        <SectionPage
          title={activeNav.label}
          eyebrow={activeNav.eyebrow}
          description={activeNav.description}
          image={activeNav.image}
          fallback={activeNav.fallback}
          index={activeNavIndex}
          total={NAV_ITEMS.length}
          dynamic={activeNav.path === '/life'}
          lanyard={activeNav.path === '/about'}
          lineSidebar={activeNav.path === '/work'}
          accordion={activeNav.path === '/projects'}
          profileCard={activeNav.path === '/contact'}
          onLineSidebarClick={(index) => {
            const target = WORK_DETAILS[index]
            navigateNext(target ? target.path : '/work')
          }}
          onProjectClick={(index) => {
            const target = PROJECT_ROUTE_PATHS[index]
            navigateNext(target ?? '/projects')
          }}
          onBack={() => navigate('/')}
          onNext={() =>
            navigateNext(
              NAV_ITEMS[(activeNavIndex + 1) % NAV_ITEMS.length].path,
            )
          }
        />
      ) : (
        <>
          <section
            className="relative h-screen w-full overflow-hidden bg-black"
            data-spotlight-radius={SPOTLIGHT_R}
            style={{ height: '100dvh' }}
          >
          <div
            className="hero-bg-zoom absolute inset-0 z-10 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
          />

          <RevealLayer image={BG_IMAGE_2} radius={SPOTLIGHT_R} />

          <div
            className="hero-intro-mask pointer-events-none absolute inset-0 z-[80] bg-[#0a0b0a]"
            aria-hidden="true"
          />

          <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-0 px-6 text-center">
            <h1 className="text-white leading-[0.95]">
              <span className="hero-line">
                <span className="hero-line-inner block hero-display">作品集</span>
              </span>
            </h1>
            <div className="hero-meta max-w-[320px] text-sm leading-relaxed text-white/80 md:max-w-[420px]">
              致力于打造个性化和有目的空间，深化人与空间的联系
            </div>
          </div>

          </section>

        </>
      )}
      </Suspense>
    </div>
  )
}
