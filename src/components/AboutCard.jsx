import { site } from '../data/site'

export default function AboutCard() {
  return (
    <div className="card-enter bento-span rounded-3xl p-6 glass-light-white text-slate-800 dark:text-white col-span-6 theme-surface">
      <h3 className="font-display font-bold text-base mb-3 text-blue-600 dark:text-white">About me</h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200">
        Innovative Full-Stack Developer and Startup Founder with a proven track record of architecting
        end-to-end, business-focused tech solutions. Specializes in software-hardware integration and
        robust mobile &amp; web platforms (React, Laravel, Flutter). My{' '}
        <a href="#projects" className="kw-link">
          skills
        </a>{' '}
        and{' '}
        <a href="#experience" className="kw-link">
          experience
        </a>{' '}
        span MVP conception, UI/UX design, market validation, and commercial deployment — plus consistent
        First Honor Dean&apos;s Lister standing at NU Lipa.
      </p>
      <p className="mt-3 text-sm italic font-mono font-medium text-blue-700 dark:text-yellow-400">
        {site.about.tagline}
      </p>
    </div>
  )
}
