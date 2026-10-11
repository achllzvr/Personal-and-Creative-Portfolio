import { createElement, Fragment, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from 'motion/react'
import { cn } from '../../lib/utils'

function mapEase(ease) {
  if (typeof ease !== 'string') return 'power2.out'
  const easeMap = {
    linear: 'none',
    easeIn: 'power2.in',
    easeOut: 'power2.out',
    easeInOut: 'power2.inOut',
  }
  return easeMap[ease] ?? 'power2.out'
}

/**
 * Text Emerge — one-shot opacity + y (no blur/scale).
 */
export default function TextEmerge({
  text = '',
  staggerFrom = 'start',
  tag = 'p',
  className,
  style,
  active = true,
  transition = {
    duration: 0.34,
    delay: 0,
    ease: 'easeOut',
    staggerChildren: 0.018,
  },
}) {
  const containerRef = useRef(null)
  const playedRef = useRef(false)
  const reduce = useReducedMotion()
  const words = String(text).trim().split(/\s+/).filter(Boolean)

  const duration = transition.duration ?? 0.34
  const delay = transition.delay ?? 0
  const staggerEach = transition.staggerChildren ?? 0.018
  const ease = transition.ease

  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return

    const wordEls = root.querySelectorAll('.word')
    if (!wordEls.length) return

    gsap.killTweensOf(wordEls)

    if (!active) {
      playedRef.current = false
      gsap.set(wordEls, { opacity: 0, y: 8, force3D: true })
      return
    }

    if (playedRef.current) return
    playedRef.current = true

    if (reduce) {
      gsap.set(wordEls, { opacity: 1, y: 0, clearProps: 'transform' })
      return
    }

    gsap.set(wordEls, { opacity: 0, y: 8, force3D: true })
    gsap.to(wordEls, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger: { each: staggerEach, from: staggerFrom },
      ease: mapEase(ease),
      overwrite: 'auto',
      force3D: true,
    })
  }, [active, text, staggerFrom, reduce, duration, delay, staggerEach, ease])

  return createElement(
    tag,
    {
      ref: containerRef,
      className: cn(
        'm-0 block w-full whitespace-pre-wrap',
        !active && 'invisible',
        className,
      ),
      style,
      'aria-hidden': active ? undefined : true,
    },
    words.map((word, index) => (
      <Fragment key={`${word}-${index}`}>
        <span className="word inline-block">{word}</span>
        {index < words.length - 1 ? ' ' : null}
      </Fragment>
    )),
  )
}
