import { useCarousel } from '../hooks/useCarousel'

export default function ProjectsCard({ items }) {
  const { trackRef, activeIndex, scrollTo } = useCarousel(items.length)

  return (
    <div
      id="projects"
      className="card-enter bento-span rounded-3xl p-6 glass-light-white text-slate-800 dark:text-white col-span-6 theme-surface"
    >
      <h3 className="font-display font-bold text-base mb-4 text-blue-600 dark:text-white">Projects</h3>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-hide pb-1 snap-x snap-mandatory"
      >
        {items.map((project) => (
          <div
            key={project.title}
            className="snap-start flex-shrink-0 rounded-2xl p-4 w-56 relative child-glass-blue-light text-white"
          >
            <h4 className="font-display font-bold text-sm">{project.title}</h4>
            <p className="text-xs text-blue-100 mt-1 mb-12">{project.description}</p>
            <span className="absolute bottom-3 left-3 inline-block text-xs font-mono pill-glass text-white rounded-lg px-3 py-1.5">
              {project.status}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 mt-3 justify-center">
        {items.map((project, index) => (
          <button
            key={project.title}
            type="button"
            aria-label={`Go to project ${index + 1}`}
            onClick={() => scrollTo(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'w-5 bg-blue-500 dark:bg-blue-400'
                : 'w-6 bg-white/40 dark:bg-blue-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
