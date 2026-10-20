import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react'
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import creativeWorks from '../data/creative.json'
import { asset } from '../utils/assets'
import VariableFontHoverByLetter from './VariableFontHoverByLetter'
import CreativeCaseStudy, { SECTION_COUNT } from './creative/CreativeCaseStudy'
import DockNav from './creative/DockNav'
import ImageMotionTrail from './creative/ImageMotionTrail'

const EASE = [0.22, 1, 0.36, 1]
const DOCK_EASE = [0.42, 0, 0.58, 1]
const EXIT_EASE = [0.4, 0, 0.2, 1]
const SLIDE_EASE = [0.45, 0, 0.55, 1]
const INTRO_LABEL = "hi, I'm achilles"
const TYPE_CHAR_MS = 36
const HEADLINE_LAYOUT_ID = 'creative-headline'
/** Keep one display size — no shrink on case entry */
const DISPLAY_FONT = 'clamp(2.4rem, 9vw, 7.5rem)'
const TRAIL_COPIES = 4

/** Enter / exit timings (ms) */
const T = {
  dockOut: 520,
  textSlide: 620,
  iconIn: 480,
  container: 170,
  content: 240,
  exitFade: 520,
  blankHold: 120,
}

function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    const update = () => setCoarse(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return coarse
}

function useTrailSize() {
  const [size, setSize] = useState(160)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setSize(mq.matches ? 176 : 144)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return size
}

function suffixFor(work) {
  if (!work) return ''
  return `and I ${work.verb} ${work.name}`
}

/**
 * Creative portfolio — dock out → text slides up → icon fades up → subtext → case.
 */
export default function CreativeHome({ active = true }) {
  const reduce = useReducedMotion()
  const isTouch = useIsCoarsePointer()
  const trailSize = useTrailSize()
  const timersRef = useRef([])

  const [dockOpen, setDockOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [showHeroIcon, setShowHeroIcon] = useState(false)
  const [headlineInCase, setHeadlineInCase] = useState(false)
  const [suffixActive, setSuffixActive] = useState(false)
  const [containerStep, setContainerStep] = useState(0)
  const [contentStep, setContentStep] = useState(0)
  const [detailsExiting, setDetailsExiting] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [trailLive, setTrailLive] = useState(false)
  const [scrollHintVisible, setScrollHintVisible] = useState(false)

  const works = creativeWorks
  const selected = useMemo(
    () => works.find((w) => w.id === selectedId) ?? null,
    [works, selectedId],
  )

  const headlineSuffix = useMemo(() => suffixFor(selected), [selected])

  const dockItems = useMemo(
    () =>
      works.map((w) => ({
        id: w.id,
        label: w.name,
        iconSrc: w.icon,
        work: w,
      })),
    [works],
  )

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current = []
  }, [])

  const later = useCallback(
    (fn, ms) => {
      if (reduce) {
        fn()
        return
      }
      const id = setTimeout(fn, ms)
      timersRef.current.push(id)
    },
    [reduce],
  )

  useEffect(() => () => clearTimers(), [clearTimers])

  // Prefetch dock icons so select doesn't hitch on decode
  useEffect(() => {
    works.forEach((w) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = asset(w.icon)
    })
  }, [works])

  useEffect(() => {
    if (active) return
    clearTimers()
    setTrailLive(false)
    setDockOpen(false)
    setScrollHintVisible(false)
  }, [active, clearTimers])

  // Show scroll helper once the case study has fully loaded
  useEffect(() => {
    if (phase !== 'ready' || !selectedId) {
      setScrollHintVisible(false)
      return undefined
    }

    setScrollHintVisible(true)
    const threshold = Math.max(160, Math.round(window.innerHeight * 0.22))

    const onScroll = () => {
      if (window.scrollY >= threshold) setScrollHintVisible(false)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [phase, selectedId])

  const openDock = useCallback(() => {
    if (!active || phase !== 'idle') return
    setDockOpen(true)
  }, [active, phase])

  const onIntroTap = useCallback(() => {
    if (!active || !isTouch || phase !== 'idle') return
    setDockOpen((v) => !v)
  }, [active, isTouch, phase])

  const onItemSelect = useCallback(
    (item) => {
      if (!active) return
      if (phase === 'entering' || phase === 'exiting') return
      if (selectedId === item.id && phase === 'ready') return

      clearTimers()
      window.scrollTo(0, 0)

      const suffix = suffixFor(item.work)
      const typedMs = Math.max(suffix.length * TYPE_CHAR_MS, 200)

      setPhase('entering')
      setDetailsExiting(false)
      setContainerStep(0)
      setContentStep(0)
      setTrailLive(false)
      setSuffixActive(false)
      setShowHeroIcon(false)
      setScrollHintVisible(false)
      setSelectedId(item.id)

      // 1) Dock leaves immediately
      setDockOpen(false)
      // 2) Main text slides up into case header (same font size)
      setHeadlineInCase(true)

      if (reduce) {
        setShowHeroIcon(true)
        setSuffixActive(true)
        setTrailLive(true)
        setContainerStep(SECTION_COUNT)
        setContentStep(SECTION_COUNT)
        setPhase('ready')
        return
      }

      // 3) After text lands, icon fades / slides up into place
      later(() => setShowHeroIcon(true), T.textSlide)

      // Trail after icon settle + case ready (avoid RAF during enter choreography)
      later(() => setTrailLive(true), T.textSlide + T.iconIn + 80)

      // 4) Subtext under main line
      const suffixAt = T.textSlide + T.iconIn * 0.55
      later(() => setSuffixActive(true), suffixAt)

      // 5) Case study sections — startTransition keeps slide/typewriter smooth
      const containersStart = suffixAt + typedMs + 120
      for (let i = 1; i <= SECTION_COUNT; i++) {
        later(
          () => startTransition(() => setContainerStep(i)),
          containersStart + (i - 1) * T.container,
        )
      }

      const contentStart = containersStart + SECTION_COUNT * T.container + 40
      for (let i = 1; i <= SECTION_COUNT; i++) {
        later(
          () => startTransition(() => setContentStep(i)),
          contentStart + (i - 1) * T.content,
        )
      }

      later(
        () => setPhase('ready'),
        contentStart + SECTION_COUNT * T.content,
      )
    },
    [active, phase, selectedId, clearTimers, later, reduce],
  )

  const clearCaseContent = useCallback(() => {
    setContentStep(0)
    setContainerStep(0)
    setDetailsExiting(false)
    setSuffixActive(false)
    setHeadlineInCase(false)
    setShowHeroIcon(false)
    setSelectedId(null)
    setTrailLive(false)
    setScrollHintVisible(false)
    window.scrollTo(0, 0)
  }, [])

  const closeCase = useCallback(() => {
    if (phase !== 'ready' && phase !== 'entering') return
    if (!selectedId) return

    clearTimers()
    setPhase('exiting')
    setTrailLive(false)
    setDetailsExiting(true)
    setDockOpen(false)
    setSuffixActive(false)

    if (reduce) {
      clearCaseContent()
      setDockOpen(true)
      setPhase('idle')
      return
    }

    later(() => {
      clearCaseContent()
    }, T.exitFade)

    later(() => {
      setPhase('idle')
      setDockOpen(true)
    }, T.exitFade + T.blankHold)
  }, [phase, selectedId, clearTimers, later, reduce, clearCaseContent])

  useEffect(() => {
    const onKey = (e) => {
      if (!active) return
      if (e.key !== 'Escape') return
      if (phase === 'ready' || (phase === 'entering' && selectedId)) {
        closeCase()
        return
      }
      if (phase === 'idle' && dockOpen) setDockOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, phase, selectedId, dockOpen, closeCase])

  const dockT = reduce
    ? { duration: 0 }
    : { duration: T.dockOut / 1000, ease: DOCK_EASE }
  const textSlideT = reduce
    ? { duration: 0 }
    : {
        layout: { duration: T.textSlide / 1000, ease: SLIDE_EASE },
        duration: T.textSlide / 1000,
        ease: SLIDE_EASE,
      }
  const iconInT = reduce
    ? { duration: 0 }
    : { duration: T.iconIn / 1000, ease: SLIDE_EASE }
  const exitT = reduce
    ? { duration: 0 }
    : { duration: T.exitFade / 1000, ease: EXIT_EASE }

  const caseOnPage = Boolean(selectedId) || headlineInCase
  const showCenteredHeadline = !headlineInCase && phase === 'idle'
  const exiting = phase === 'exiting' || detailsExiting
  const mountCaseStudy =
    Boolean(selected) && (containerStep > 0 || detailsExiting)
  const sliding = phase === 'entering' && !showHeroIcon

  return (
    <LayoutGroup>
      <section className="relative min-h-dvh" aria-label="Creative portfolio">
        {/* True-center sticky intro — no hover lift */}
        {showCenteredHeadline ? (
          <div className="pointer-events-none fixed inset-0 z-[2] flex items-center justify-center px-4">
            <motion.div
              layoutId={HEADLINE_LAYOUT_ID}
              transition={textSlideT}
              className="pointer-events-auto relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center"
              onMouseEnter={
                !isTouch && phase === 'idle' ? openDock : undefined
              }
              style={{ willChange: sliding ? 'transform' : 'auto' }}
            >
              <h2 className="sr-only">{INTRO_LABEL}</h2>
              <div
                className={phase === 'idle' && isTouch ? 'cursor-pointer' : undefined}
                onClick={phase === 'idle' ? onIntroTap : undefined}
                role={phase === 'idle' && isTouch ? 'button' : undefined}
                tabIndex={phase === 'idle' && isTouch ? 0 : undefined}
                aria-expanded={dockOpen}
                aria-controls="creative-dock"
                onKeyDown={
                  phase === 'idle' && isTouch
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onIntroTap()
                        }
                      }
                    : undefined
                }
              >
                <VariableFontHoverByLetter
                  key="headline-prefix"
                  label={INTRO_LABEL}
                  fromWeight={400}
                  toWeight={900}
                  fontSize={DISPLAY_FONT}
                  staggerDuration={30}
                  staggerFrom="first"
                  gradientMatch="achi"
                  className="justify-center text-center text-blue-900 dark:text-white"
                  style={{ width: 'auto', maxWidth: '100%', marginInline: 'auto' }}
                />
              </div>
              {phase === 'idle' && !dockOpen && isTouch ? (
                <p className="pointer-events-none mt-6 text-center text-xs text-blue-900/45 dark:text-white/40">
                  Tap to open apps
                </p>
              ) : null}
            </motion.div>
          </div>
        ) : null}

        {caseOnPage ? (
          <motion.div
            className="relative z-[2] min-h-dvh"
            initial={false}
            animate={exiting ? { opacity: 0 } : { opacity: 1 }}
            transition={exitT}
            style={{
              willChange: exiting ? 'opacity' : 'auto',
              pointerEvents: phase === 'exiting' ? 'none' : 'auto',
            }}
          >
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-10 pt-24 sm:pt-28">
              {/* Reserved icon slot so text slide lands under a stable spot */}
              <div
                className="relative mx-auto mb-6 shrink-0 sm:mb-8"
                style={{ width: trailSize, height: trailSize }}
              >
                <AnimatePresence>
                  {showHeroIcon && selected ? (
                    <motion.div
                      key={`hero-${selected.id}`}
                      className="absolute inset-0"
                      initial={reduce ? false : { opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={iconInT}
                    >
                      <motion.img
                        src={asset(selected.icon)}
                        alt={`${selected.name} icon`}
                        draggable={false}
                        decoding="async"
                        className="h-full w-full rounded-[22%] object-cover"
                        animate={{ opacity: trailLive ? 0 : 1 }}
                        transition={{ duration: 0.22, ease: EASE }}
                        style={{
                          position: trailLive ? 'absolute' : 'relative',
                          inset: trailLive ? 0 : undefined,
                          pointerEvents: 'none',
                        }}
                      />
                      {trailLive ? (
                        <ImageMotionTrail
                          image={{
                            src: asset(selected.icon),
                            alt: `${selected.name} icon`,
                          }}
                          alt={`${selected.name} icon`}
                          active={active && phase === 'ready'}
                          track="page"
                          copies={reduce ? 1 : TRAIL_COPIES}
                          itemWidth={trailSize}
                          itemHeight={trailSize}
                          rounded={22}
                          fade={32}
                          speed={48}
                          hoverOut="hold"
                          background="transparent"
                          motion={{
                            tiltX: 10,
                            tiltY: 14,
                            twist: 5,
                            shiftX: 72,
                            shiftY: 48,
                          }}
                        />
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {headlineInCase ? (
                <motion.div
                  layoutId={HEADLINE_LAYOUT_ID}
                  transition={textSlideT}
                  className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
                  style={{ willChange: sliding ? 'transform' : 'auto' }}
                >
                  <h2 className="sr-only">
                    {selected
                      ? `${INTRO_LABEL} ${headlineSuffix}`
                      : INTRO_LABEL}
                  </h2>
                  <VariableFontHoverByLetter
                    key="headline-prefix"
                    label={INTRO_LABEL}
                    fromWeight={400}
                    toWeight={900}
                    fontSize={DISPLAY_FONT}
                    staggerDuration={30}
                    staggerFrom="first"
                    gradientMatch="achi"
                    className="justify-center text-center text-blue-900 dark:text-white"
                    style={{
                      width: 'auto',
                      maxWidth: '100%',
                      marginInline: 'auto',
                    }}
                  />
                  <AnimatePresence>
                    {suffixActive && headlineSuffix ? (
                      <motion.div
                        key={`suffix-${selectedId}`}
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { duration: 0.32, ease: EXIT_EASE }
                        }
                        className="mt-3 w-full"
                      >
                        <VariableFontHoverByLetter
                          label={headlineSuffix}
                          fromWeight={400}
                          toWeight={900}
                          fontSize={DISPLAY_FONT}
                          staggerDuration={20}
                          staggerFrom="start"
                          gradientMatch=""
                          boldMatch={selected?.name}
                          boldWeight={700}
                          typeFrom={0}
                          typeActive={suffixActive}
                          typeCharMs={TYPE_CHAR_MS}
                          className="justify-center text-center text-blue-900 dark:text-white"
                          style={{
                            width: 'auto',
                            maxWidth: '100%',
                            marginInline: 'auto',
                          }}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ) : null}
            </div>

            {mountCaseStudy ? (
              <div className="mx-auto w-full max-w-5xl px-4 pb-36 sm:px-6 sm:pb-40">
                <CreativeCaseStudy
                  work={selected}
                  containerStep={containerStep}
                  contentStep={contentStep}
                  exiting={detailsExiting}
                  onClose={closeCase}
                  backDisabled={phase !== 'ready'}
                />
              </div>
            ) : null}
          </motion.div>
        ) : (
          <div className="min-h-dvh" aria-hidden />
        )}

        <AnimatePresence>
          {scrollHintVisible && phase === 'ready' ? (
            <motion.div
              key="scroll-hint"
              className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 8 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.4, ease: EXIT_EASE, delay: 0.15 }
              }
            >
              <p className="flex flex-col items-center gap-1.5 text-center text-xs tracking-wide text-blue-900/45 dark:text-white/40">
                <span
                  className="inline-block text-[0.7rem] opacity-80"
                  style={
                    reduce
                      ? undefined
                      : {
                          animation:
                            'creative-scroll-hint-bounce 1.6s ease-in-out infinite',
                        }
                  }
                  aria-hidden
                >
                  ↓
                </span>
                scroll down to see details
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          id="creative-dock"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          initial={false}
          animate={
            dockOpen && active
              ? { y: 0, opacity: 1 }
              : { y: 88, opacity: 0 }
          }
          transition={dockT}
          style={{
            willChange: dockOpen || phase === 'entering' ? 'transform, opacity' : 'auto',
          }}
          aria-hidden={!dockOpen || !active}
        >
          <div
            className="mx-auto w-full max-w-4xl"
            style={{ pointerEvents: dockOpen && active ? 'auto' : 'none' }}
          >
            <DockNav
              items={dockItems}
              onItemSelect={onItemSelect}
              selectedId={null}
              fadeInIcons={false}
              sharedLayout={false}
              interactive={active && phase === 'idle'}
              className="w-full"
            />
          </div>
        </motion.div>
      </section>
    </LayoutGroup>
  )
}
