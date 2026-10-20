import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { BackgroundRippleEffect } from './components/BackgroundRippleEffect'
import BentoGrid from './components/BentoGrid'
import ContactModal from './components/ContactModal'
import CreativeHome from './components/CreativeHome'
import Header from './components/Header'
import { ModeProvider, useMode } from './context/ModeContext'
import { ThemeProvider } from './context/ThemeContext'
import { cn } from './lib/utils'

/** CSS opacity crossfade — avoid transform/contain so `position:fixed` stays viewport-true */
const VIEW_MS = 420

function AppShell() {
  const { isCreative } = useMode()
  const reduce = useReducedMotion()
  const [contactOpen, setContactOpen] = useState(false)
  const bentoEnteredRef = useRef(false)
  const [skipBentoEnter, setSkipBentoEnter] = useState(false)
  const [seenCreative, setSeenCreative] = useState(isCreative)
  const [seenPersonal, setSeenPersonal] = useState(!isCreative)

  const openContact = useCallback(() => setContactOpen(true), [])
  const closeContact = useCallback(() => setContactOpen(false), [])

  useEffect(() => {
    if (isCreative) setSeenCreative(true)
    else setSeenPersonal(true)
  }, [isCreative])

  useEffect(() => {
    if (!isCreative) {
      if (bentoEnteredRef.current) setSkipBentoEnter(true)
      else bentoEnteredRef.current = true
    }
  }, [isCreative])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [isCreative])

  // After crossfade, hide inactive view from paint (keeps mount for instant return)
  const [paintCreative, setPaintCreative] = useState(isCreative)
  const [paintPersonal, setPaintPersonal] = useState(!isCreative)

  useEffect(() => {
    if (isCreative) {
      setPaintCreative(true)
      const t = window.setTimeout(() => setPaintPersonal(false), reduce ? 0 : VIEW_MS)
      return () => window.clearTimeout(t)
    }
    setPaintPersonal(true)
    const t = window.setTimeout(() => setPaintCreative(false), reduce ? 0 : VIEW_MS)
    return () => window.clearTimeout(t)
  }, [isCreative, reduce])

  const fadeStyle = {
    transition: reduce ? 'none' : `opacity ${VIEW_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  }

  return (
    <div className="relative min-h-dvh">
      <div className="page-bg" aria-hidden="true">
        <div className="page-bg-ripple">
          <BackgroundRippleEffect />
        </div>
      </div>

      <div
        className="mosaic-layer pointer-events-none fixed inset-0 z-[1] overflow-hidden opacity-70 dark:opacity-100"
        aria-hidden="true"
      >
        <div className="mosaic-square top-8 right-24 h-16 w-16 bg-blue-700/30" />
        <div className="mosaic-square top-4 right-48 h-8 w-8 bg-blue-600/20" />
        <div className="mosaic-square top-16 right-6 h-12 w-24 bg-blue-800/25" />
        <div className="mosaic-square top-32 right-32 h-10 w-10 bg-blue-500/15" />
        <div className="mosaic-square top-2 right-72 h-6 w-6 bg-blue-400/20" />
        <div className="mosaic-square top-24 right-56 h-8 w-20 bg-blue-900/30" />
      </div>

      <Header />

      <div className="relative z-10 min-h-dvh">
        {seenCreative ? (
          <div
            key="creative"
            aria-hidden={!isCreative}
            inert={!isCreative || undefined}
            className={cn(
              'min-h-dvh',
              isCreative
                ? 'relative opacity-100'
                : 'pointer-events-none absolute inset-0 overflow-hidden opacity-0',
            )}
            style={{
              ...fadeStyle,
              zIndex: isCreative ? 2 : 1,
              visibility: paintCreative ? 'visible' : 'hidden',
            }}
          >
            <CreativeHome active={isCreative} />
          </div>
        ) : null}

        {seenPersonal ? (
          <div
            key="personal"
            aria-hidden={isCreative}
            inert={isCreative || undefined}
            className={cn(
              /* Desktop classes unchanged — mobile overrides live in .personal-shell CSS */
              'personal-shell mx-auto w-full max-w-[1400px] px-4 pb-6 pt-24 sm:px-6',
              isCreative
                ? 'pointer-events-none absolute inset-0 overflow-hidden opacity-0'
                : 'relative opacity-100',
            )}
            style={{
              ...fadeStyle,
              zIndex: isCreative ? 1 : 2,
              visibility: paintPersonal ? 'visible' : 'hidden',
            }}
          >
            <BentoGrid onOpenContact={openContact} skipEnter={skipBentoEnter} />
          </div>
        ) : null}
      </div>

      <ContactModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ModeProvider>
        <AppShell />
      </ModeProvider>
    </ThemeProvider>
  )
}
