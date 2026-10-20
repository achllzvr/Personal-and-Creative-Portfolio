import { useEffect, useRef, useState } from 'react'
import { useCarousel } from '../hooks/useCarousel'
import CarouselControls from './CarouselControls'

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
      className="card-enter bento-span gallery-card relative col-span-4 rounded-3xl p-5 glass-blue-gallery text-white"
      style={{ zIndex: focused ? 50 : 'auto' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">Gallery</h3>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/20 text-xs text-white"
          aria-hidden="true"
        >
          ···
        </span>
      </div>

      <CarouselControls
        className="gallery-carousel-stage"
        count={items.length}
        activeIndex={activeIndex}
        onSelect={scrollTo}
        label="gallery item"
      >
        <div
          ref={trackRef}
          className="gallery-track scroll-hide relative z-10 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto
                     scroll-smooth px-4 pb-8 -mb-8 pointer-events-none
                     pt-[200px] -mt-[200px]
                     md:pt-[300px] md:-mt-[300px]"
        >
          {items.map((item, index) => (
            <div
              key={`${item.title}-${item.year}`}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              data-index={index}
              className={`gallery-item-wrapper group relative w-full flex-shrink-0 snap-center
                          transition-[opacity,transform] duration-300 pointer-events-auto
                          hover:z-50
                          ${visible[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
              onMouseEnter={() => onFocusChange?.(true)}
              onMouseLeave={() => onFocusChange?.(false)}
            >
              <div className="gallery-item-media relative mb-3 aspect-[2/1] w-full">
                <div
                  className="gallery-item-frame absolute bottom-0 left-0 z-10 h-max max-h-full w-full origin-bottom
                             cursor-pointer overflow-hidden rounded-3xl border border-transparent shadow-md
                             transition-[transform,max-height,box-shadow,border-color] duration-300 ease-out
                             group-hover:z-50 group-hover:max-h-[800px] group-hover:-translate-y-2
                             group-hover:scale-[1.03] group-hover:border-white/70 group-hover:shadow-xl
                             dark:group-hover:border-blue-400/30"
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-auto min-h-full w-full object-cover object-top"
                    onError={(e) => {
                      if (item.fallbackImage) e.currentTarget.src = item.fallbackImage
                    }}
                  />
                  <div className="gallery-item-scrim pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent transition-opacity duration-300 group-hover:opacity-60" />
                  <div className="gallery-item-caption pointer-events-none absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md border border-white/40 bg-white/30 shadow-md">
                        <span className="text-[9px] font-bold text-white">{item.initial}</span>
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-white drop-shadow-md">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="truncate text-[11px] italic text-white/80 drop-shadow-sm">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gallery-item-meta relative z-0 rounded-2xl border border-gray-300 bg-white/50 p-4 text-center child-glass-white-light dark:border-white/30 dark:bg-white/20">
                <p className="text-sm italic text-gray-800 dark:text-white/90">{item.quote}</p>
                <span className="mt-3 inline-block rounded-full border border-white/40 bg-white/30 px-2 py-0.5 font-mono text-xs dark:border-white/30 dark:bg-white/10">
                  {item.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CarouselControls>
    </div>
  )
}
