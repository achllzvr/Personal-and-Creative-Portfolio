import { cn } from '../lib/utils'

/**
 * Swipe carousel chrome: dash indicators under the track (no arrows).
 *
 *   <CarouselControls count={…} activeIndex={…} onSelect={…}>
 *     <div ref={trackRef} className="…-track">…</div>
 *   </CarouselControls>
 */
export default function CarouselControls({
  count,
  activeIndex,
  onSelect,
  className,
  label = 'item',
  children,
}) {
  return (
    <div className={cn('carousel-stage', className)}>
      <div className="carousel-viewport">{children}</div>

      {count > 1 ? (
        <div className="carousel-dots" role="tablist" aria-label={`${label} slides`}>
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-label={`Go to ${label} ${index + 1}`}
              aria-selected={index === activeIndex}
              onClick={() => onSelect(index)}
              className={cn(
                'carousel-dot',
                index === activeIndex && 'carousel-dot--active',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
