import { useEffect, useRef, useState } from 'react'
import { useCarousel } from '../hooks/useCarousel'

export default function GalleryCard({ items, focused = false, onFocusChange }) {
  const { trackRef, activeIndex, scrollTo } = useCarousel(items.length)
  const itemRefs = useRef([])
  const [visible, setVisible] = useState(() => items.map((_, i) => i === 0))

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        setVisible((prev) => {
          const next = [...prev]
          entries.forEach((entry) => {
            const idx = Number(entry.target.dataset.index)
            if (!Number.isNaN(idx)) next[idx] = entry.isIntersecting
          })
          return next
        })
      },
      { root: track, threshold: 0.5 },
    )

    itemRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [items.length, trackRef])

  return (
    <div
      id="gallery-bento-card"
      className="card-enter bento-span rounded-3xl p-5 glass-blue-gallery text-white col-span-4 relative"
      style={{ zIndex: focused ? 50 : 'auto' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm">Gallery</h3>
        <span
          className="w-7 h-7 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center text-xs"
          aria-hidden="true"
        >
          ···
        </span>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-hide snap-x snap-mandatory scroll-smooth
                   pt-[200px] -mt-[200px] pb-8 -mb-8 px-4 -mx-4 z-10 relative pointer-events-none
                   md:pt-[300px] md:-mt-[300px]"
      >
        {items.map((item, index) => (
          <div
            key={`${item.title}-${item.year}`}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            data-index={index}
            className={`gallery-item-wrapper snap-center flex-shrink-0 w-full group relative
                        hover:z-50 transition-[opacity,transform] duration-300 pointer-events-auto
                        ${visible[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            onMouseEnter={() => onFocusChange?.(true)}
            onMouseLeave={() => onFocusChange?.(false)}
          >
            <div className="relative w-full aspect-[2/1] mb-3">
              <div
                className="absolute bottom-0 left-0 w-full rounded-3xl overflow-hidden
                           h-max max-h-full group-hover:max-h-[800px]
                           transition-[transform,max-height,box-shadow,border-color] duration-300 ease-out
                           group-hover:-translate-y-2 group-hover:scale-[1.03]
                           z-10 group-hover:z-50 origin-bottom cursor-pointer
                           border border-transparent
                           group-hover:border-white/70 dark:group-hover:border-blue-400/30
                           shadow-md
                           group-hover:shadow-xl"
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto min-h-full object-cover object-top"
                  onError={(e) => {
                    if (item.fallbackImage) e.currentTarget.src = item.fallbackImage
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-60" />
                <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white/30 border border-white/40 flex items-center justify-center shadow-md">
                      <span className="text-white text-[9px] font-bold">{item.initial}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white drop-shadow-md">{item.title}</span>
                      {item.subtitle ? (
                        <span className="text-[11px] text-white/80 italic drop-shadow-sm">{item.subtitle}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4 child-glass-white-light dark:bg-white/20 bg-white/50 border dark:border-white/30 border-gray-300 text-center relative z-0">
              <p className="text-sm italic text-gray-800 dark:text-white/90">{item.quote}</p>
              <span className="inline-block mt-3 text-xs font-mono dark:bg-white/10 bg-white/30 px-2 py-0.5 rounded-full border dark:border-white/30 border-white/40">
                {item.year}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mt-3 justify-center relative z-20 pointer-events-auto">
        {items.map((item, index) => (
          <button
            key={`${item.title}-dot`}
            type="button"
            aria-label={`Go to gallery item ${index + 1}`}
            onClick={() => scrollTo(index)}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
              index === activeIndex ? 'w-5 bg-white' : 'w-4 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
