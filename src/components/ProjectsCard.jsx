import { useCarousel } from '../hooks/useCarousel'
import CarouselControls from './CarouselControls'

export default function ProjectsCard({ items }) {
  const { trackRef, activeIndex, scrollTo } = useCarousel(items.length)

  return (
    <div
      id="projects"
      className="card-enter bento-span projects-card theme-surface col-span-6 rounded-3xl p-6 glass-light-white text-slate-800 dark:text-white"
    >
      <h3 className="mb-4 font-display text-base font-bold text-blue-600 dark:text-white">Projects</h3>

      <CarouselControls
        count={items.length}
        activeIndex={activeIndex}
        onSelect={scrollTo}
        label="project"
      >
        <div
          ref={trackRef}
          className="projects-track scroll-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
        >
          {items.map((project) => (
            <div
              key={project.title}
              className="projects-item child-glass-blue-light relative flex w-56 flex-shrink-0 snap-start flex-col rounded-2xl p-4 text-white"
            >
              <h4 className="font-display text-sm font-bold">{project.title}</h4>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-blue-100">{project.description}</p>
              <span className="pill-glass mt-3 inline-block self-start rounded-lg px-3 py-1.5 font-mono text-xs text-white">
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </CarouselControls>
    </div>
  )
}
