import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, stagger, useAnimate, useReducedMotion } from 'motion/react'
import { cn } from '../lib/utils'

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
  /** Substring rendered bold by default (e.g. app name). Uses last match. */
  boldMatch: null,
  boldWeight: 700,
  /**
   * If set, letters at index >= typeFrom reveal one-by-one (typewriter),
   * while keeping the same variable-font hover letter styling.
   */
  typeFrom: null,
  typeActive: false,
  typeCharMs: 36,
  onTypeComplete: undefined,
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
    boldMatch,
    boldWeight,
    transition: transitionProp,
    typeFrom,
    typeActive,
    typeCharMs,
    onTypeComplete,
  } = { ...DEFAULTS, ...props }

  const fromSettings = `'wght' ${fromWeight}`
  const toSettings = `'wght' ${toWeight}`
  const boldSettings = `'wght' ${boldWeight}`
  const staggerSec = Math.max(0, staggerDuration) / 1000
  const typingEnabled = typeof typeFrom === 'number' && typeFrom >= 0

  const reduceMotion = useReducedMotion()
  const [scope, animate] = useAnimate()
  const [hovered, setHovered] = useState(false)
  const [typedCount, setTypedCount] = useState(() =>
    typingEnabled ? typeFrom : Number.POSITIVE_INFINITY,
  )
  const typeDoneRef = useRef(false)
  const onTypeCompleteRef = useRef(onTypeComplete)
  onTypeCompleteRef.current = onTypeComplete

  const gradientIndices = useMemo(() => {
    if (!label || !gradientMatch) return new Set()
    const start = label.toLowerCase().indexOf(String(gradientMatch).toLowerCase())
    if (start < 0) return new Set()
    return new Set(
      Array.from({ length: gradientMatch.length }, (_, i) => start + i),
    )
  }, [label, gradientMatch])

  const boldIndices = useMemo(() => {
    if (!label || !boldMatch) return new Set()
    const needle = String(boldMatch)
    const start = label.toLowerCase().lastIndexOf(needle.toLowerCase())
    if (start < 0) return new Set()
    return new Set(Array.from({ length: needle.length }, (_, i) => start + i))
  }, [label, boldMatch])

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
      // Restore default weight; keep boldMatch letters at boldWeight
      animate(
        '.letter:not(.letter--bold)',
        { fontVariationSettings: fromSettings },
        mergeStagger(transition),
      )
      if (boldIndices.size > 0) {
        animate(
          '.letter--bold',
          { fontVariationSettings: boldSettings },
          mergeStagger(transition),
        )
      }
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
    boldSettings,
    boldIndices,
    staggerSec,
    staggerFrom,
    shuffledIndices,
    transition,
    animate,
  ])

  // Typewriter reveal for the suffix — same letter nodes / hover as the prefix
  useEffect(() => {
    typeDoneRef.current = false

    if (!typingEnabled) {
      setTypedCount(Number.POSITIVE_INFINITY)
      return undefined
    }

    const start = Math.min(typeFrom, label.length)

    if (!typeActive) {
      setTypedCount(start)
      return undefined
    }

    if (reduceMotion) {
      setTypedCount(label.length)
      if (!typeDoneRef.current) {
        typeDoneRef.current = true
        onTypeCompleteRef.current?.()
      }
      return undefined
    }

    setTypedCount(start)
    let i = start
    let timer = 0

    const tick = () => {
      i += 1
      setTypedCount(i)
      if (i >= label.length) {
        if (!typeDoneRef.current) {
          typeDoneRef.current = true
          onTypeCompleteRef.current?.()
        }
        return
      }
      timer = window.setTimeout(tick, Math.max(12, typeCharMs))
    }

    timer = window.setTimeout(tick, Math.max(12, typeCharMs))
    return () => window.clearTimeout(timer)
  }, [typingEnabled, typeFrom, typeActive, typeCharMs, label, reduceMotion])

  const handleHoverStart = () => {
    setHovered(true)
    debouncedHoverStartRef.current?.()
  }

  const handleHoverEnd = () => {
    setHovered(false)
    debouncedHoverEndRef.current?.()
  }

  const letters = label ? label.split('') : []
  const visibleLimit = typingEnabled ? typedCount : letters.length

  // Keep words intact so letter spans never wrap mid-word ("develope" / "d").
  const wordChunks = useMemo(() => {
    if (!label) return []
    const chunks = []
    let letterIndex = 0
    for (const part of label.split(/(\s+)/)) {
      if (!part) continue
      if (/^\s+$/.test(part)) {
        chunks.push({ type: 'space', text: part, start: letterIndex })
        letterIndex += part.length
      } else {
        chunks.push({ type: 'word', text: part, start: letterIndex })
        letterIndex += part.length
      }
    }
    return chunks
  }, [label])

  return (
    <div
      className={cn('flex w-full flex-wrap items-center', className)}
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
      {letters.length === 0 ? null : (
        <span
          ref={scope}
          className="leading-[1.05] tracking-tight"
          style={{
            fontFamily: VARIABLE_FONT_STACK,
            fontSize: fontSize ?? 'clamp(2.4rem, 9vw, 7.5rem)',
            color: color ?? 'currentColor',
          }}
        >
          <span className="sr-only">{label}</span>
          {wordChunks.map((chunk, chunkIndex) => {
            if (chunk.type === 'space') {
              const chars = chunk.text.split('').filter((_, i) => chunk.start + i < visibleLimit)
              if (chars.length === 0) return null
              return (
                <span key={`space-${chunkIndex}`} aria-hidden>
                  {chars.map((ch, i) => (
                    <motion.span
                      key={`s-${chunk.start + i}`}
                      className="letter inline-block whitespace-pre"
                      style={{ fontVariationSettings: fromSettings }}
                    >
                      {ch === ' ' ? '\u00A0' : ch}
                    </motion.span>
                  ))}
                </span>
              )
            }

            const visibleLetters = chunk.text
              .split('')
              .map((letter, i) => ({ letter, globalIndex: chunk.start + i }))
              .filter(({ globalIndex }) => globalIndex < visibleLimit)

            if (visibleLetters.length === 0) return null

            return (
              <span
                key={`word-${chunkIndex}-${chunk.text}`}
                className="inline-block whitespace-nowrap"
                aria-hidden
              >
                {visibleLetters.map(({ letter, globalIndex }) => {
                  const isAchi = gradientIndices.has(globalIndex)
                  const isBold = boldIndices.has(globalIndex)

                  return (
                    <motion.span
                      key={`${letter}-${globalIndex}`}
                      className={cn(
                        'letter inline-block',
                        isBold && 'letter--bold',
                        isAchi && 'achi-letter',
                        isAchi && hovered && 'achi-letter--flow',
                      )}
                      style={{
                        fontVariationSettings: isBold
                          ? boldSettings
                          : fromSettings,
                      }}
                    >
                      {letter}
                    </motion.span>
                  )
                })}
              </span>
            )
          })}
        </span>
      )}
    </div>
  )
}
