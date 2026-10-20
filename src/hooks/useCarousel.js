import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Horizontal snap carousel: tracks active index from scroll and exposes navigation.
 */
export function useCarousel(itemCount) {
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track || !track.children.length) return

    const center = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity

    for (let i = 0; i < track.children.length; i++) {
      const child = track.children[i]
      const mid = child.offsetLeft + child.offsetWidth / 2
      const dist = Math.abs(mid - center)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    }

    setActiveIndex(Math.max(0, Math.min(itemCount - 1, best)))
  }, [itemCount])

  const scrollTo = useCallback((index) => {
    const track = trackRef.current
    const child = track?.children[index]
    if (!track || !child) return

    const left = child.offsetLeft - (track.clientWidth - child.offsetWidth) / 2
    track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [])

  const scrollPrev = useCallback(() => {
    const next = Math.max(0, activeIndex - 1)
    scrollTo(next)
  }, [activeIndex, scrollTo])

  const scrollNext = useCallback(() => {
    const next = Math.min(itemCount - 1, activeIndex + 1)
    scrollTo(next)
  }, [activeIndex, itemCount, scrollTo])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    track.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => track.removeEventListener('scroll', onScroll)
  }, [onScroll])

  return {
    trackRef,
    activeIndex,
    scrollTo,
    scrollPrev,
    scrollNext,
    setActiveIndex,
  }
}
