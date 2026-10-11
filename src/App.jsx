import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BackgroundRippleEffect } from './components/BackgroundRippleEffect'
import BentoGrid from './components/BentoGrid'
import ContactModal from './components/ContactModal'
import CreativePlaceholder from './components/CreativePlaceholder'
import Header from './components/Header'
import { ModeProvider, useMode } from './context/ModeContext'
import { ThemeProvider } from './context/ThemeContext'

const VIEW_EASE = [0.22, 1, 0.36, 1]
const VIEW_DURATION = 0.38

function AppShell() {
  const { isCreative } = useMode()
  const [contactOpen, setContactOpen] = useState(false)
  const bentoEnteredRef = useRef(false)
  const [skipBentoEnter, setSkipBentoEnter] = useState(false)

  const openContact = useCallback(() => setContactOpen(true), [])
  const closeContact = useCallback(() => setContactOpen(false), [])

  // After the first personal visit, don't replay staggered card-enter (main stutter source)
  useEffect(() => {
    if (!isCreative) {
      if (bentoEnteredRef.current) setSkipBentoEnter(true)
      else bentoEnteredRef.current = true
    }
  }, [isCreative])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [isCreative])

  return (
    <div className="relative min-h-dvh">
      <div className="page-bg" aria-hidden="true">
        <div className="page-bg-ripple">
          <BackgroundRippleEffect />
        </div>
      </div>

      <div
        className="mosaic-layer fixed inset-0 z-[1] overflow-hidden pointer-events-none opacity-70 dark:opacity-100"
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

      <div className="relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          {isCreative ? (
            <motion.div
              key="creative"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: VIEW_DURATION, ease: VIEW_EASE }}
              className="min-h-dvh"
            >
              <CreativePlaceholder />
            </motion.div>
          ) : (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: VIEW_DURATION, ease: VIEW_EASE }}
              className="mx-auto w-full max-w-[1400px] px-4 pb-6 pt-24 sm:px-6"
            >
              <BentoGrid onOpenContact={openContact} skipEnter={skipBentoEnter} />
            </motion.div>
          )}
        </AnimatePresence>
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
