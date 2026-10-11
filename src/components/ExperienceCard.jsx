export default function ExperienceCard({ items }) {
  return (
    <div
      id="experience"
      className="card-enter bento-span rounded-3xl p-5 glass-blue-experience text-white col-span-3 row-span-3"
    >
      <h3 className="font-display font-bold text-sm mb-5 text-center tracking-wide text-white">
        Experience
      </h3>

      <div className="experience-track flex flex-col gap-4 relative pl-2">
        <div className="absolute left-3 top-4 bottom-4 timeline-line max-[1024px]:hidden" />
        {items.map((exp) => (
          <div key={`${exp.role}-${exp.year}-${exp.organization}`} className="exp-item relative pl-6 max-[1024px]:pl-0">
            <div
              className={`exp-dot absolute left-0 w-3 h-3 rounded-full ${exp.dotColor} border-2 ${exp.borderColor} mt-1 max-[1024px]:hidden`}
            />
            <div className="rounded-xl p-3 child-glass-experience border">
              <p className="font-display font-bold text-xs">{exp.role}</p>
              <p className="text-xs text-white/80 mt-0.5">{exp.organization}</p>
              <span className="inline-block mt-2 text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/30">
                {exp.year}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
