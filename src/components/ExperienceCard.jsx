export default function ExperienceCard({ items }) {
  return (
    <div
      id="experience"
      className="card-enter bento-span col-span-3 row-span-3 rounded-3xl p-5 glass-blue-experience text-white"
    >
      <h3 className="mb-5 text-center font-display text-sm font-bold tracking-wide text-white">
        Experience
      </h3>

      <div className="experience-track relative flex flex-col gap-4 pl-2">
        <div className="timeline-line absolute bottom-4 left-3 top-4" aria-hidden />
        {items.map((exp) => (
          <div
            key={`${exp.role}-${exp.year}-${exp.organization}`}
            className="exp-item relative pl-6"
          >
            <div
              className={`exp-dot absolute left-0 mt-1 h-3 w-3 rounded-full border-2 ${exp.dotColor} ${exp.borderColor}`}
              aria-hidden
            />
            <div className="child-glass-experience rounded-xl border p-3">
              <p className="font-display text-xs font-bold">{exp.role}</p>
              <p className="mt-0.5 text-xs text-white/80">{exp.organization}</p>
              <span className="mt-2 inline-block rounded-full border border-white/30 bg-white/10 px-2 py-0.5 font-mono text-xs">
                {exp.year}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
