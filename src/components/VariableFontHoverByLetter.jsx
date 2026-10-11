import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, stagger, useAnimate } from 'motion/react'
import { cn } from '../lib/utils'

const INTER_VARIABLE_FONT_FACE = `
@font-face {
  font-family: "InterVariableFramer";
  src: url("https://rsms.me/inter/font-files/InterVariable.woff2?v=4.0") format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "InterVariableFramer";
  src: url("https://rsms.me/inter/font-files/InterVariable-Italic.woff2?v=4.0") format("woff2-variations");
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}
`

const VARIABLE_FONT_STACK =
  '"InterVariableFramer", "Inter Variable", "Inter", system-ui, sans-serif'

const DEFAULTS = {
  label: 'hi, I’m achilles',
  fromWeight: 400,
  toWeight: 900,
  fontSize: undefined,
  color: undefined,
  staggerDuration: 30,
  staggerFrom: 'random',
  transition: {
    type: 'spring',
    duration: 0.7,
    bounce: 0.2,
  },
  /** Substring whose letters get the blue gradient on hover (default: "achi") */
  gradientMatch: 'achi',
}

/**
 * Weight Hover — Originkit / Variable font letter stagger.
 * Adapted to JSX + motion/react for this portfolio.
 */
export default function VariableFontHoverByLetter(props) {
  const {
    label,
    fromWeight,
    toWeight,
    staggerDuration,
    staggerFrom,
    fontSize,
    color,
    onClick,
    style,
    className,
    gradientMatch,
    transition: transitionProp,
  } = { ...DEFAULTS, ...props }

  const fromSettings = `'wght' ${fromWeight}`
  const toSettings = `'wght' ${toWeight}`
  const staggerSec = Math.max(0, staggerDuration) / 1000

  const [scope, animate] = useAnimate()
  const [hovered, setHovered] = useState(false)

  const gradientIndices = useMemo(() => {
    if (!label || !gradientMatch) return new Set()
    const start = label.toLowerCase().indexOf(String(gradientMatch).toLowerCase())
    if (start < 0) return new Set()
    return new Set(
      Array.from({ length: gradientMatch.length }, (_, i) => start + i),
    )
  }, [label, gradientMatch])

  const shuffledIndices = useMemo(() => {
    if (staggerFrom !== 'random') return null
    const len = label ? label.length : 0
    const indices = Array.from({ length: len }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }, [label, staggerFrom])

  const transition = useMemo(
    () => transitionProp ?? DEFAULTS.transition,
    [transitionProp],
  )

  const mergeStagger = (base) => {
    if (staggerFrom === 'random' && shuffledIndices) {
      const indices = shuffledIndices
      return {
        ...base,
        delay: (i) => staggerSec * (indices[i] ?? 0),
      }
    }
    return {
      ...base,
      delay: stagger(staggerSec, { from: staggerFrom }),
    }
  }

  const debouncedHoverStartRef = useRef(null)
  const debouncedHoverEndRef = useRef(null)
  const timerRefs = useRef({
    startTimer: null,
    startTrailing: false,
    endTimer: null,
    endTrailing: false,
  })

  useEffect(() => {
    const runStart = () => {
      animate('.letter', { fontVariationSettings: toSettings }, mergeStagger(transition))
    }

    const runEnd = () => {
      animate('.letter', { fontVariationSettings: fromSettings }, mergeStagger(transition))
    }

    const wait = 100
    const t = timerRefs.current

    debouncedHoverStartRef.current = () => {
      if (!t.startTimer) {
        runStart()
        t.startTimer = setTimeout(() => {
          if (t.startTrailing) runStart()
          t.startTrailing = false
          t.startTimer = null
        }, wait)
      } else {
        t.startTrailing = true
      }
    }

    debouncedHoverEndRef.current = () => {
      if (!t.endTimer) {
        runEnd()
        t.endTimer = setTimeout(() => {
          if (t.endTrailing) runEnd()
          t.endTrailing = false
          t.endTimer = null
        }, wait)
      } else {
        t.endTrailing = true
      }
    }

    return () => {
      if (t.startTimer) clearTimeout(t.startTimer)
      if (t.endTimer) clearTimeout(t.endTimer)
      t.startTimer = null
      t.endTimer = null
      t.startTrailing = false
      t.endTrailing = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- match Originkit deps; mergeStagger is local
  }, [
    fromSettings,
    toSettings,
    staggerSec,
    staggerFrom,
    shuffledIndices,
    transition,
    animate,
  ])

  const handleHoverStart = () => {
    setHovered(true)
    debouncedHoverStartRef.current?.()
  }

  const handleHoverEnd = () => {
    setHovered(false)
    debouncedHoverEndRef.current?.()
  }

  const letters = label ? label.split('') : []

  return (
    <div
      className={cn('flex w-full items-center', className)}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onFocus={handleHoverStart}
      onBlur={handleHoverEnd}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <style>{INTER_VARIABLE_FONT_FACE}</style>
      {letters.length === 0 ? null : (
        <span
          ref={scope}
          className="leading-none tracking-tight"
          style={{
            fontFamily: VARIABLE_FONT_STACK,
            fontSize: fontSize ?? 'clamp(2.4rem, 9vw, 7.5rem)',
            color: color ?? 'currentColor',
          }}
        >
          <span className="sr-only">{label}</span>
          {letters.map((letter, i) => {
            const isAchi = gradientIndices.has(i)

            return (
              <motion.span
                key={`${letter}-${i}`}
                className={cn(
                  'letter inline-block whitespace-pre',
                  isAchi && 'achi-letter',
                  isAchi && hovered && 'achi-letter--flow',
                )}
                aria-hidden
                style={{
                  fontVariationSettings: fromSettings,
                }}
              >
                {letter}
              </motion.span>
            )
          })}
        </span>
      )}
    </div>
  )
}
