import { useCarousel } from '../hooks/useCarousel'

export default function RecommendationsCard({ items }) {
  const { trackRef, activeIndex, scrollTo } = useCarousel(items.length)

  return (
    <div className="card-enter bento-span rounded-3xl p-5 sm:p-6 glass-blue-recommendations text-white col-span-8 flex flex-col min-h-0">
      <h3 className="font-display font-bold text-base text-white mb-4">Recommendations</h3>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-hide snap-x snap-mandatory flex-1 -mx-1 px-1"
      >
        {items.map((rec) => (
          <article
            key={rec.name}
            className="snap-start flex-shrink-0 w-full min-w-full child-glass rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
          >
            <header className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full bg-gradient-to-br ${rec.bgGradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}
              >
                {rec.initials}
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-sm text-gray-900 dark:text-white truncate">
                  {rec.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-blue-200/90 truncate">{rec.role}</p>
              </div>
            </header>

            <div className="border-t border-slate-200/80 dark:border-blue-400/25 pt-3">
              <p
                className="text-sm leading-relaxed text-gray-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: rec.text }}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="flex gap-1.5 mt-4 justify-center shrink-0">
        {items.map((rec, index) => (
          <button
            key={rec.name}
            type="button"
            aria-label={`Go to recommendation ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => scrollTo(index)}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
              index === activeIndex ? 'w-5 bg-white' : 'w-4 bg-white/35 hover:bg-white/55'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
