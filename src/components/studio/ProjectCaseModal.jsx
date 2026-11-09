import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BrandMark } from './BrandMark'

const EXIT_MS = 360

function Section({ title, children }) {
  if (!children) return null
  return (
    <section className="case-section">
      <p className="case-section-kicker">{title}</p>
      {children}
    </section>
  )
}

export default function ProjectCaseModal({ project, open, onClose }) {
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState('closed') // closed | open | closing
  const closeBtnRef = useRef(null)
  const projectRef = useRef(project)

  // Keep last project visible through the exit animation
  if (open && project) projectRef.current = project
  const active = projectRef.current

  useEffect(() => {
    if (!open) return undefined
    setMounted(true)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('open'))
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (open || !mounted) return undefined
    setPhase('closing')
    const t = window.setTimeout(() => {
      setMounted(false)
      setPhase('closed')
    }, EXIT_MS)
    return () => window.clearTimeout(t)
  }, [open, mounted])

  useEffect(() => {
    if (phase !== 'open') return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus({ preventScroll: true })

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [phase, onClose])

  if (!mounted || !active || typeof document === 'undefined') return null

  const liveLinks = (active.links || []).filter((l) => l.href && l.href !== '#')
  const phaseClass = phase === 'closing' ? 'is-closing' : phase === 'open' ? 'is-open' : ''

  const requestClose = () => {
    if (phase === 'closing') return
    onClose()
  }

  return createPortal(
    <div
      className={`case-modal-overlay studio-portal ${phaseClass}`.trim()}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div
        className="case-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${active.title} case study`}
        onClick={(e) => e.stopPropagation()}
        style={{ '--brand': active.brandColor || 'var(--accent)' }}
      >
        <div className="case-modal-grid" aria-hidden="true" />

        <header className="case-modal-head case-modal-stagger">
          <div className="case-modal-brand">
            <BrandMark
              logo={active.logo}
              mark={active.markText}
              color={active.brandColor}
              label={active.title}
              size="md"
            />
            <div className="case-modal-titles">
              <p className="kicker">Case study  /  {active.year || 'Selected'}</p>
              <h2>{active.title}</h2>
              <p className="case-tagline">{active.tagline || active.subtitle}</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="case-close"
            onClick={requestClose}
            aria-label="Close case study"
          >
            ←
          </button>
        </header>

        <div className="case-modal-meta case-modal-stagger">
          {active.role ? (
            <p className="tag-line">
              <span className="accent-dot" aria-hidden="true" /> {active.role}
            </p>
          ) : null}
          {active.tag ? <span className="year-pill">{active.tag}</span> : null}
        </div>

        <div className="case-modal-body case-modal-stagger">
          <Section title="01  /  Overview">
            <p className="body">{active.description}</p>
          </Section>

          {active.problem ? (
            <Section title="02  /  Problem">
              <p className="body">{active.problem}</p>
            </Section>
          ) : null}

          {active.solution || active.features?.length ? (
            <Section title="03  /  Solution & Features">
              {active.solution ? <p className="body">{active.solution}</p> : null}
              {active.features?.length ? (
                <ul className="case-features">
                  {active.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}
            </Section>
          ) : null}

          {active.uniqueness ? (
            <Section title="04  /  What Makes It Unique">
              <p className="body">{active.uniqueness}</p>
            </Section>
          ) : null}

          {active.images?.length ? (
            <Section title="05  /  Gallery">
              <div className="case-gallery">
                {active.images.map((src) => (
                  <figure key={src} className="case-shot">
                    <img src={src} alt="" loading="lazy" />
                  </figure>
                ))}
              </div>
            </Section>
          ) : null}

          {active.stack?.length ? (
            <Section title="06  /  Tech">
              <ul className="case-tech-list">
                {active.stack.map((tech) => (
                  <li key={tech} className="stack-chip">
                    {tech}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {liveLinks.length ? (
            <Section title="07  /  Links">
              <ul className="case-links">
                {liveLinks.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a className="send case-link-btn" href={link.href} target="_blank" rel="noreferrer">
                      <span>{link.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
