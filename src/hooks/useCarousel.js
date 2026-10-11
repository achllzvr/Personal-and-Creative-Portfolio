import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Horizontal snap carousel: tracks active index from scroll and exposes scrollTo.
 */
export function useCarousel(itemCount) {
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track || !track.clientWidth) return
    const idx = Math.round(track.scrollLeft / track.clientWidth)
    setActiveIndex(Math.max(0, Math.min(itemCount - 1, idx)))
  }, [itemCount])

  const scrollTo = useCallback((index) => {
    const track = trackRef.current
    if (!track || !track.children[index]) return
    track.children[index].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [onScroll])

  return { trackRef, activeIndex, scrollTo, setActiveIndex }
}
