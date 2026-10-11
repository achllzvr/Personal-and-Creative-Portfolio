import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ModeContext = createContext(null)
const STORAGE_KEY = 'portfolio-mode'
/** Match App view crossfade so rapid toggles don't stack mid-animation */
const MODE_LOCK_MS = 480

function readStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'creative' || stored === 'personal') return stored
  } catch {
    /* ignore */
  }
  return 'personal'
}

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(readStoredMode)
  const lockUntilRef = useRef(0)

  const setPortfolioMode = useCallback((next) => {
    if (next !== 'personal' && next !== 'creative') return
    if (next === mode) return
    const now = Date.now()
    if (now < lockUntilRef.current) return
    lockUntilRef.current = now + MODE_LOCK_MS
    setMode(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [mode])

  const toggleMode = useCallback(() => {
    setPortfolioMode(mode === 'personal' ? 'creative' : 'personal')
  }, [mode, setPortfolioMode])

  const value = useMemo(
    () => ({
      mode,
      isPersonal: mode === 'personal',
      isCreative: mode === 'creative',
      setPortfolioMode,
      toggleMode,
    }),
    [mode, setPortfolioMode, toggleMode],
  )

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within ModeProvider')
  return ctx
}
