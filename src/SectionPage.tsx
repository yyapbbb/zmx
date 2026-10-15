import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Suspense, lazy, memo, useCallback, useEffect, useState } from 'react'
import LineSidebar from './LineSidebar'
import StrataImage from './StrataImage'
import { LIFE_WALL_ITEMS, LIFE_WALL_THUMBS } from './lifeImages'
import {
  loadDriftWall,
  loadImageDetailPage,
  loadLanyard,
  loadProfileCard,
  loadProjectAccordion,
  loadProjectDetailPage,
  loadWorkDetailPage,
  prefetchWhenIdle,
} from './routeChunks'
import cardFront from './assets/card-front.jpg'
import contactAvatar from './assets/contact-avatar.jpg'
import { WORK_ITEMS } from './workDetails'

const ABOUT_FACTS = [
  '姓名：钟美兴',
  '职业：室内设计师',
  '学历：广东生态工程职业学院（大专）',
  '专业：环境艺术设计专业',
]

const ABOUT_INTRO = [
  '简介：本人性格热情开朗，对设计冲满热情和喜欢.待人友好，为人真诚谦虚',
  '　　　能吃苦耐劳，尽职尽责，有耐心，善于与人沟通，诚恳勤奋好学脚踏实地',
  '　　　工作积极进取，在完成工作过程中和同事一起共同进退解决问题，团队配和精神强',
  '　　　适应能力强,态度认真，抗压能力强',
  '　　　有自己的独立思考',
  '　　　（把空间设计成私人化）',
]

const DriftWall = lazy(loadDriftWall)
const Lanyard = lazy(loadLanyard)
const ProfileCard = lazy(loadProfileCard)
const ProjectAccordion = lazy(loadProjectAccordion)

const BLANK_CARD_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGPg4uYCAABCACAfLCVSAAAAAElFTkSuQmCC'

const LANYARD_POSITION: [number, number, number] = [0, 0, 19]
const LANYARD_GRAVITY: [number, number, number] = [0, -40, 0]
const LANYARD_OFFSET: [number, number, number] = [-0.35, 0.15, 0]

type LifeWallProps = {
  paused: boolean
  onOpen: (title: string) => void
}

const LifeWall = memo(function LifeWall({ paused, onOpen }: LifeWallProps) {
  return (
    <DriftWall
      items={LIFE_WALL_THUMBS}
      onTileOpen={(item: { image: string; title: string; href?: string }) => onOpen(item.title)}
      columns={6}
      tileWidth={180}
      tileHeight={120}
      gap={14}
      tilt={16}
      turn={-14}
      perspective={1200}
      depth={120}
      speed={34}
      direction="up"
      variance={0.45}
      parallax={0.5}
      lift={64}
      fade={0.6}
      dim={0.55}
      overlayColor="#060010"
      paused={paused}
    />
  )
})

type SectionPageProps = {
  title: string
  eyebrow: string
  description: string
  image: string
  fallback: string
  index: number
  total: number
  dynamic?: boolean
  lanyard?: boolean
  lineSidebar?: boolean
  accordion?: boolean
  profileCard?: boolean
  onLineSidebarClick?: (index: number) => void
  onProjectClick?: (index: number) => void
  onBack: () => void
  onNext: () => void
}

export default function SectionPage({
  title,
  eyebrow,
  description,
  image,
  fallback,
  index,
  total,
  dynamic = false,
  lanyard = false,
  lineSidebar = false,
  accordion = false,
  profileCard = false,
  onLineSidebarClick,
  onProjectClick,
  onBack,
  onNext,
}: SectionPageProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (lineSidebar) {
      prefetchWhenIdle(() => {
        void loadWorkDetailPage()
        void loadImageDetailPage()
      })
    }
    if (accordion) {
      prefetchWhenIdle(() => {
        void loadProjectDetailPage()
        void loadImageDetailPage()
      })
    }
  }, [lineSidebar, accordion])

  const openLifeLightbox = useCallback((title: string) => {
    const found = LIFE_WALL_ITEMS.findIndex((entry) => entry.title === title)
    setLightboxIndex(found >= 0 ? found : 0)
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return
    const total = LIFE_WALL_ITEMS.length
    if (total === 0) return
    for (let offset = -1; offset <= 1; offset += 1) {
      const item = LIFE_WALL_ITEMS[((lightboxIndex + offset) % total + total) % total]
      if (!item) continue
      const preloader = new Image()
      preloader.decoding = 'async'
      preloader.src = item.image
      void preloader.decode().catch(() => {})
    }
  }, [lightboxIndex])

  return (
    <>
    <main className="page-enter relative min-h-screen overflow-hidden bg-[#080908]">
      {lanyard ? (
        <div className="absolute inset-y-0 left-0 z-0 w-[64%] max-w-[760px] sm:w-[58%] md:w-[52%]">
          <Suspense fallback={null}>
            <Lanyard
              position={LANYARD_POSITION}
              fov={19}
              gravity={LANYARD_GRAVITY}
              cardScale={1.22}
              offset={LANYARD_OFFSET}
              frontImage={cardFront}
              lanyardImage={BLANK_CARD_IMAGE}
            />
          </Suspense>
        </div>
      ) : profileCard ? (
        <div className="absolute inset-0 z-0 flex items-center justify-center px-6 pb-14 pt-28">
          <Suspense fallback={null}>
            <ProfileCard
              className="pc-card--flat"
              avatarUrl={contactAvatar}
              miniAvatarUrl={contactAvatar}
              name=""
              title=""
              handle=""
              status=""
              contactText=""
              showUserInfo={false}
              showEffects={false}
              enableTilt={false}
              behindGlowEnabled={false}
              onContactClick={() => {}}
            />
          </Suspense>
        </div>
      ) : accordion ? (
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <ProjectAccordion onImageClick={(index) => onProjectClick?.(index)} />
          </Suspense>
        </div>
      ) : dynamic ? (
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <LifeWall paused={lightboxIndex !== null} onOpen={openLifeLightbox} />
          </Suspense>
        </div>
      ) : (
        <StrataImage
          src={image}
          alt={title}
          fallback={fallback}
          iconClassName="h-20 w-20 text-white/15"
          eager
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/45 to-black/15" />
      {lanyard && (
        <div className="pointer-events-none absolute left-[38.5%] top-[26.5%] z-[5] hidden md:block">
          <div className="text-[clamp(14px,1.06vw,34px)] leading-[3.45] text-white">
            {ABOUT_FACTS.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-[0.89em] text-[clamp(14px,1.06vw,34px)] leading-[1.725] text-white">
            {ABOUT_INTRO.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      )}
      {lineSidebar && (
        <div className="pointer-events-auto absolute right-4 top-1/2 z-20 -translate-y-1/2 sm:right-8 md:right-14 lg:right-20">
          <LineSidebar
            items={WORK_ITEMS}
            accentColor="#f0863f"
            textColor="#d6d6d6"
            markerColor="#8c8c8c"
            showIndex={false}
            showMarker
            proximityRadius={175}
            maxShift={30}
            falloff="smooth"
            markerLength={70}
            markerGap={0}
            tickScale={0.92}
            scaleTick={false}
            itemGap={28}
            fontSize={1.15}
            smoothing={100}
            defaultActive={0}
            className="work-line-sidebar"
            onItemClick={(index) => onLineSidebarClick?.(index)}
          />
        </div>
      )}
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-end px-5 pb-20 pt-32 sm:px-10 md:px-16 lg:pb-24">
        <div className="max-w-3xl">
          {!profileCard && (
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0863f]">
              {eyebrow}
            </p>
          )}
          {!dynamic && !lanyard && !lineSidebar && !accordion && !profileCard && (
            <h1 className="font-playfair mt-4 text-5xl font-normal italic leading-[0.95] text-white sm:text-7xl md:text-8xl">
              {title}
            </h1>
          )}
          {!lanyard && !accordion && !profileCard && (
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              {description}
            </p>
          )}
          {!dynamic && !lanyard && !lineSidebar && !accordion && !profileCard && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onBack}
                className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              >
                <ArrowLeft size={17} />
                返回首页
              </button>
              <button
                onClick={onNext}
                className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#e8702a] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 active:scale-95"
              >
                下一项
                <span className="text-white/70">
                  {index + 1}/{total}
                </span>
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
      {lightboxIndex !== null && (
        <div className="pointer-events-auto fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setLightboxIndex(null)
            }}
            className="pointer-events-auto absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={() =>
              setLightboxIndex((current) =>
                current === null ? 0 : (current - 1 + LIFE_WALL_ITEMS.length) % LIFE_WALL_ITEMS.length,
              )
            }
            className="pointer-events-auto absolute left-5 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label="上一张"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="max-w-5xl text-center">
            <div className="relative mx-auto max-h-[76vh] w-fit max-w-[92vw]">
              <img
                src={
                  LIFE_WALL_THUMBS[lightboxIndex]?.image ||
                  LIFE_WALL_ITEMS[lightboxIndex].image
                }
                alt={LIFE_WALL_ITEMS[lightboxIndex].title}
                decoding="async"
                className="max-h-[76vh] max-w-[92vw] rounded-lg object-contain shadow-2xl w-auto h-auto"
              />
              <img
                src={LIFE_WALL_ITEMS[lightboxIndex].image}
                alt={LIFE_WALL_ITEMS[lightboxIndex].title}
                decoding="async"
                onLoad={(event) => {
                  event.currentTarget.style.opacity = '1'
                }}
                className="absolute inset-0 h-full w-full rounded-lg object-contain opacity-0 transition-opacity duration-300"
              />
            </div>
            <p className="mt-4 text-sm font-medium text-white/80">
              {LIFE_WALL_ITEMS[lightboxIndex].title}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setLightboxIndex((current) =>
                current === null ? 0 : (current + 1) % LIFE_WALL_ITEMS.length,
              )
            }
            className="pointer-events-auto absolute right-5 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            aria-label="下一张"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </>
  )
}
