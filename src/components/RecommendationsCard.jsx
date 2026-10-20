import { useCarousel } from '../hooks/useCarousel'
import CarouselControls from './CarouselControls'

export default function RecommendationsCard({ items }) {
  const { trackRef, activeIndex, scrollTo } = useCarousel(items.length)

  return (
    <div className="card-enter bento-span recs-card col-span-8 flex min-h-0 flex-col rounded-3xl p-5 glass-blue-recommendations text-white sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-white">Recommendations</h3>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/20 text-xs text-white"
          aria-hidden="true"
        >
          ···
        </span>
      </div>

      <CarouselControls
        className="recs-carousel flex min-h-0 flex-1 flex-col"
        count={items.length}
        activeIndex={activeIndex}
        onSelect={scrollTo}
        label="recommendation"
      >
        <div
          ref={trackRef}
          className="recs-track scroll-hide flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto"
        >
          {items.map((rec) => (
            <article
              key={rec.name}
              className="recs-item child-glass mx-auto flex w-full min-w-full flex-shrink-0 snap-center flex-col gap-3 rounded-2xl p-4 sm:p-5"
            >
              <header className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ${rec.bgGradient}`}
                >
                  {rec.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-gray-900 dark:text-white">
                    {rec.name}
                  </p>
                  <p className="truncate text-xs text-slate-600 dark:text-blue-200/90">{rec.role}</p>
                </div>
              </header>

              <div className="border-t border-slate-200/80 pt-3 dark:border-blue-400/25">
                <p
                  className="text-sm leading-relaxed text-gray-800 dark:text-slate-200"
                  dangerouslySetInnerHTML={{ __html: rec.text }}
                />
              </div>
            </article>
          ))}
        </div>
      </CarouselControls>
    </div>
  )
}
