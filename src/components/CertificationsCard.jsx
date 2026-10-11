export default function CertificationsCard({ items }) {
  return (
    <div className="card-enter bento-span rounded-3xl p-6 glass-light-white text-slate-800 dark:text-white col-span-6 theme-surface">
      <h3 className="font-display font-bold text-base mb-4 text-blue-600 dark:text-white">
        Certifications and Awards
      </h3>

      <div className="flex gap-4 overflow-x-auto scroll-hide snap-x snap-mandatory pb-1">
        {items.map((cert) => (
          <div
            key={cert.title}
            className="snap-start flex-shrink-0 rounded-2xl p-4 w-56 flex items-start gap-3 child-glass-white-gradient"
          >
            <div
              className={`cert-icon ${cert.iconBg} border ${cert.iconBorder} ${cert.iconTextDark} ${cert.iconTextLight}`}
            >
              {cert.icon}
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-blue-700 dark:text-white">{cert.title}</h4>
              <p
                className="text-xs text-slate-600 dark:text-blue-100 mt-0.5"
                dangerouslySetInnerHTML={{ __html: cert.description }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
