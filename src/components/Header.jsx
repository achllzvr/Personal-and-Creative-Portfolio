import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useMode } from '../context/ModeContext'
import { useTheme } from '../context/ThemeContext'
import { site } from '../data/site'
import { cn } from '../lib/utils'

const HOTZONE_PX = 18
const HIDE_DELAY_MS = 380
const INTRO_SHOW_MS = 1100
/** Auto-hide only where hover can reveal the bar (desktop width) */
const DESKTOP_MQ = '(min-width: 1025px)'

const SLIDE = {
  type: 'tween',
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1],
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])

  return matches
}

export default function Header() {
  const { isDark, isTransitioning, toggleTheme } = useTheme()
  const { mode, isCreative, setPortfolioMode } = useMode()
  const isDesktop = useMediaQuery(DESKTOP_MQ)
  const [revealed, setRevealed] = useState(true)
  const hideTimerRef = useRef(null)
  const introTimerRef = useRef(null)

  const autoHide = isCreative && isDesktop

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  const showBar = () => {
    clearHideTimer()
    setRevealed(true)
  }

  const scheduleHide = () => {
    if (!autoHide) return
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      setRevealed(false)
      hideTimerRef.current = null
    }, HIDE_DELAY_MS)
  }

  useEffect(() => {
    clearHideTimer()
    if (introTimerRef.current) {
      clearTimeout(introTimerRef.current)
      introTimerRef.current = null
    }

    if (!autoHide) {
      setRevealed(true)
      return undefined
    }

    setRevealed(true)
    introTimerRef.current = setTimeout(() => {
      setRevealed(false)
      introTimerRef.current = null
    }, INTRO_SHOW_MS)

    return () => {
      clearHideTimer()
      if (introTimerRef.current) clearTimeout(introTimerRef.current)
    }
  }, [autoHide])

  const barVisible = !autoHide || revealed
  const title = mode === 'creative' ? 'Creative Portfolio' : site.title

  return (
    <>
      {autoHide ? (
        <div
          className="pointer-events-auto fixed inset-x-0 top-0 z-[60]"
          style={{ height: HOTZONE_PX }}
          onMouseEnter={showBar}
          aria-hidden="true"
        />
      ) : null}

      <motion.header
        initial={false}
        animate={{ y: barVisible ? 0 : '-105%' }}
        transition={SLIDE}
        className={cn(
          'top-bar-glass pointer-events-auto fixed inset-x-0 top-0 z-[61]',
          !barVisible && 'pointer-events-none',
        )}
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
        onMouseEnter={autoHide ? showBar : undefined}
        onMouseLeave={autoHide ? scheduleHide : undefined}
      >
        {/* Desktop markup/classes preserved — mobile sizing via CSS */}
        <div className="header-inner mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6">
          <div className="relative min-h-[2.25rem] min-w-0 flex-1 overflow-hidden pr-4 sm:min-h-[2.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-2xl font-extrabold tracking-tight text-blue-900 sm:text-3xl dark:text-white"
              >
                {title}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="header-controls flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              disabled={isTransitioning}
              className="header-theme-btn flex h-11 w-11 cursor-pointer items-center justify-center rounded-full
                         border border-slate-200/80 bg-white/70 shadow-lg
                         transition-transform duration-200 hover:scale-105
                         disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100
                         dark:border-blue-500/40 dark:bg-navy-900/80"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <div
              className="header-mode-toggle flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1.5 shadow-lg
                         dark:border-blue-500/40 dark:bg-navy-900/80"
              role="group"
              aria-label="Portfolio mode"
            >
              <button
                type="button"
                onClick={() => setPortfolioMode('personal')}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-colors duration-200 ${
                  mode === 'personal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-blue-800/55 hover:text-blue-900 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
                aria-pressed={mode === 'personal'}
                aria-label="Personal portfolio"
              >
                ⌘
              </button>
              <button
                type="button"
                onClick={() => setPortfolioMode('creative')}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-base leading-none transition-colors duration-200 ${
                  mode === 'creative'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-blue-800/55 hover:text-blue-900 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
                aria-pressed={mode === 'creative'}
                aria-label="Creative portfolio"
              >
                ☺
              </button>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  )
}
