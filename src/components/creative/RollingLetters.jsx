import { createElement, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from 'motion/react'
import { cn } from '../../lib/utils'

const startYPercentMap = {
  top: -80,
  bottom: 80,
}

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
 * Rolling Letters — one-shot, transform-only, force3D.
 */
export default function RollingLetters({
  text = '',
  startFrom = 'bottom',
  staggerFrom = 'center',
  tag = 'p',
  className,
  style,
  active = true,
  transition = {
    duration: 0.36,
    delay: 0,
    ease: 'easeOut',
    staggerChildren: 0.018,
  },
}) {
  const containerRef = useRef(null)
  const playedRef = useRef(false)
  const reduce = useReducedMotion()

  const duration = transition.duration ?? 0.36
  const delay = transition.delay ?? 0
  const staggerEach = transition.staggerChildren ?? 0.018
  const ease = transition.ease

  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return

    const chars = root.querySelectorAll('.char')
    if (!chars.length) return

    gsap.killTweensOf(chars)

    if (!active) {
      playedRef.current = false
      gsap.set(chars, {
        yPercent: startYPercentMap[startFrom] ?? startYPercentMap.bottom,
        opacity: 0,
        force3D: true,
      })
      return
    }

    if (playedRef.current) return
    playedRef.current = true

    if (reduce) {
      gsap.set(chars, { yPercent: 0, opacity: 1, clearProps: 'transform' })
      return
    }

    gsap.set(chars, {
      yPercent: startYPercentMap[startFrom] ?? startYPercentMap.bottom,
      opacity: 1,
      force3D: true,
    })
    gsap.to(chars, {
      yPercent: 0,
      duration,
      delay,
      stagger: { each: staggerEach, from: staggerFrom },
      ease: mapEase(ease),
      overwrite: 'auto',
      force3D: true,
    })
  }, [active, text, startFrom, staggerFrom, reduce, duration, delay, staggerEach, ease])

  return createElement(
    tag,
    {
      ref: containerRef,
      className: cn(
        'm-0 block overflow-hidden whitespace-pre-wrap',
        !active && 'invisible',
        className,
      ),
      style,
      'aria-label': text,
      'aria-hidden': active ? undefined : true,
    },
    String(text)
      .split('')
      .map((char, index) => (
        <span key={`${char}-${index}`} className="char inline-block" aria-hidden>
          {char === ' ' ? '\u00A0' : char}
        </span>
      )),
  )
}
