import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { site } from '../data/site'

const ThemeContext = createContext(null)

/** Keep profile GIF short — long locks + gradient keyframes felt laggy */
const GIF_DURATION_MS = 2200
const IMAGE_FADE_MS = 180
const GIF_FADE_MS = 220
const DESKTOP_PROFILE_MQ = '(min-width: 1025px)'

const INITIAL_TRANSITION = {
  showGif: false,
  gifOpacity: 0,
  imageOpacity: 1,
  gifKey: 0,
}

function canPlayDesktopGif() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true
  }
  return window.matchMedia(DESKTOP_PROFILE_MQ).matches
}

function applyDarkClass(isDark) {
  document.documentElement.classList.toggle('dark', isDark)
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [gifReady, setGifReady] = useState(false)
  const [transitionState, setTransitionState] = useState(INITIAL_TRANSITION)
  const timersRef = useRef([])
  const transitioningRef = useRef(false)

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }, [])

  const finishTransition = useCallback(() => {
    setTransitionState((prev) => ({
      ...prev,
      showGif: false,
      gifOpacity: 0,
      imageOpacity: 1,
    }))
    transitioningRef.current = false
    setIsTransitioning(false)
    document.documentElement.classList.remove('theme-switching')
  }, [])

  useEffect(() => {
    const photo = new Image()
    photo.decoding = 'async'
    photo.src = site.photo

    if (!canPlayDesktopGif()) {
      setGifReady(true)
      return undefined
    }

    const gif = new Image()
    gif.decoding = 'async'
    gif.src = site.transitionGif
    const done = () => setGifReady(true)
    if (gif.complete) done()
    else {
      gif.onload = done
      gif.onerror = done
    }
    return undefined
  }, [])

  useEffect(() => {
    applyDarkClass(isDark)
  }, [isDark])

  useEffect(() => () => clearTimers(), [clearTimers])

  const playProfileTransition = useCallback(() => {
    clearTimers()
    transitioningRef.current = true
    setIsTransitioning(true)

    if (!canPlayDesktopGif()) {
      finishTransition()
      return
    }

    setTransitionState((prev) => ({
      ...prev,
      showGif: false,
      gifOpacity: 0,
      imageOpacity: 0,
    }))

    schedule(() => {
      setTransitionState((prev) => ({
        showGif: true,
        gifOpacity: 1,
        imageOpacity: 0,
        gifKey: prev.gifKey + 1,
      }))

      schedule(() => {
        setTransitionState((prev) => ({
          ...prev,
          gifOpacity: 0,
        }))

        schedule(() => {
          finishTransition()
        }, GIF_FADE_MS)
      }, GIF_DURATION_MS)
    }, IMAGE_FADE_MS)
  }, [clearTimers, finishTransition, schedule])

  const toggleTheme = useCallback(() => {
    if (transitioningRef.current) return
    const next = !isDark

    transitioningRef.current = true
    setIsTransitioning(true)
    document.documentElement.classList.add('theme-switching')

    const afterThemePaint = () => {
      playProfileTransition()
    }

    // Native cross-fade when available — much smoother than thrashing every color transition
    if (typeof document.startViewTransition === 'function') {
      const vt = document.startViewTransition(() => {
        setIsDark(next)
        applyDarkClass(next)
      })
      vt.finished.finally(afterThemePaint)
      return
    }

    setIsDark(next)
    applyDarkClass(next)
    afterThemePaint()
  }, [isDark, playProfileTransition])

  const value = useMemo(
    () => ({
      isDark,
      isTransitioning,
      gifReady,
      transitionState,
      toggleTheme,
      transitionGif: site.transitionGif,
    }),
    [isDark, isTransitioning, gifReady, transitionState, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
