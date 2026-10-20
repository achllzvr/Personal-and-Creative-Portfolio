import { useCarousel } from '../hooks/useCarousel'
import CarouselControls from './CarouselControls'

export default function CertificationsCard({ items }) {
  const { trackRef, activeIndex, scrollTo } = useCarousel(items.length)

  return (
    <div className="card-enter bento-span certs-card theme-surface col-span-6 rounded-3xl p-6 glass-light-white text-slate-800 dark:text-white">
      <h3 className="mb-4 font-display text-base font-bold text-blue-600 dark:text-white">
        Certifications and Awards
      </h3>

      <CarouselControls
        count={items.length}
        activeIndex={activeIndex}
        onSelect={scrollTo}
        label="certification"
      >
        <div
          className="certs-track scroll-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
          ref={trackRef}
        >
          {items.map((cert) => (
            <div
              key={cert.title}
              className="certs-item child-glass-white-gradient flex w-56 flex-shrink-0 snap-start items-start gap-3 rounded-2xl p-4"
            >
              <div
                className={`cert-icon ${cert.iconBg} border ${cert.iconBorder} ${cert.iconTextDark} ${cert.iconTextLight}`}
              >
                {cert.icon}
              </div>
              <div className="certs-item-body min-w-0">
                <h4 className="font-display text-xs font-bold text-blue-700 dark:text-white">
                  {cert.title}
                </h4>
                <p
                  className="mt-0.5 text-xs text-slate-600 dark:text-blue-100"
                  dangerouslySetInnerHTML={{ __html: cert.description }}
                />
              </div>
            </div>
          ))}
        </div>
      </CarouselControls>
    </div>
  )
}
