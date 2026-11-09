import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SolarIcon } from './SolarDuotoneIcons'

const EXIT_MS = 360

const COPY = {
  awards: { kicker: 'Recognition', title: 'Awards', eyebrow: 'Award', icon: 'award' },
  certifications: {
    kicker: 'Recognition',
    title: 'Certifications',
    eyebrow: 'Certification',
    icon: 'certificate',
  },
}

function Thumb({ item, fallbackIcon, className = '' }) {
  if (item.image) {
    return (
      <span className={`recog-thumb ${className}`.trim()}>
        <img src={item.image} alt="" loading="lazy" />
      </span>
    )
  }
  return (
    <span className={`recog-thumb recog-thumb--icon ${className}`.trim()} aria-hidden="true">
      <SolarIcon name={item.icon || fallbackIcon} />
    </span>
  )
}

/**
 * Click-through for the About carousels:
 *   list of every item in that carousel  →  details for the item you pick.
 */
export default function RecognitionModal({ kind, items, open, startIndex = null, onClose }) {
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState('closed') // closed | open | closing
  const [selected, setSelected] = useState(null) // null = list view
  const closeBtnRef = useRef(null)
  const bodyRef = useRef(null)
  const kindRef = useRef(kind)
  const itemsRef = useRef(items)

  // Keep the last content on screen through the exit animation
  if (open && kind) {
    kindRef.current = kind
    itemsRef.current = items
  }
  const activeKind = kindRef.current
  const activeItems = itemsRef.current || []
  const copy = COPY[activeKind] || COPY.awards

  useEffect(() => {
    if (!open) return undefined
    setSelected(startIndex)
    setMounted(true)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('open'))
    })
    return () => cancelAnimationFrame(id)
  }, [open, startIndex])

  useEffect(() => {
    if (open || !mounted) return undefined
    setPhase('closing')
    const t = window.setTimeout(() => {
      setMounted(false)
      setPhase('closed')
    }, EXIT_MS)
    return () => window.clearTimeout(t)
  }, [open, mounted])

  const goBack = () => {
    if (selected !== null) {
      setSelected(null)
      return
    }
    onClose()
  }

  useEffect(() => {
    if (phase !== 'open') return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = prev
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'open') return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selected !== null) setSelected(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, selected, onClose])

  // Each switch between list and detail starts at the top
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [selected])

  if (!mounted || !activeItems.length || typeof document === 'undefined') return null

  const phaseClass = phase === 'closing' ? 'is-closing' : phase === 'open' ? 'is-open' : ''
  const item = selected !== null ? activeItems[selected] : null
  const lines = item ? String(item.detail || '').split(' · ').filter(Boolean) : []
  const gallery = item ? (item.images?.length ? item.images : item.image ? [item.image] : []) : []

  return createPortal(
    <div
      className={`case-modal-overlay recog-overlay studio-portal ${phaseClass}`.trim()}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && phase !== 'closing') onClose()
      }}
    >
      <div
        className="case-modal recog-modal"
        role="dialog"
        aria-modal="true"
        aria-label={item ? `${item.title} details` : `${copy.title} list`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="case-modal-head recog-head">
          <div className="case-modal-titles">
            <p className="kicker">
              {copy.kicker}  /  {item ? `${String(selected + 1).padStart(2, '0')} of ${String(activeItems.length).padStart(2, '0')}` : `${activeItems.length} total`}
            </p>
            <h2>{item ? copy.title.replace(/s$/, '') : copy.title}</h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="case-close"
            onClick={goBack}
            aria-label={item ? `Back to ${copy.title.toLowerCase()} list` : `Close ${copy.title.toLowerCase()}`}
          >
            ←
          </button>
        </header>

        <div className="recog-body" ref={bodyRef} key={item ? `detail-${selected}` : 'list'}>
          {item ? (
            <article className="recog-detail">
              {gallery.length ? (
                <div className={`recog-gallery${gallery.length > 1 ? ' recog-gallery--multi' : ''}`}>
                  {gallery.map((src) => (
                    <figure key={src} className="recog-shot">
                      <img src={src} alt={item.title} loading="lazy" />
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="recog-hero-icon" aria-hidden="true">
                  <SolarIcon name={item.icon || copy.icon} />
                </div>
              )}

              <p className="recog-eyebrow">
                <span className="accent-dot" aria-hidden="true" /> {item.eyebrow || copy.eyebrow}
              </p>
              <h3 className="recog-title">{item.title}</h3>
              <ul className="recog-lines">
                {lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <div className="recog-nav">
                <button type="button" className="recog-nav-btn" onClick={() => setSelected(null)}>
                  ← All {copy.title.toLowerCase()}
                </button>
                {activeItems.length > 1 ? (
                  <span className="recog-nav-step">
                    <button
                      type="button"
                      className="recog-nav-btn recog-nav-btn--icon"
                      aria-label="Previous"
                      onClick={() => setSelected((i) => (i - 1 + activeItems.length) % activeItems.length)}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="recog-nav-btn recog-nav-btn--icon"
                      aria-label="Next"
                      onClick={() => setSelected((i) => (i + 1) % activeItems.length)}
                    >
                      →
                    </button>
                  </span>
                ) : null}
              </div>
            </article>
          ) : (
            <ul className="recog-list">
              {activeItems.map((entry, i) => (
                <li key={`${entry.title}-${i}`}>
                  <button type="button" className="recog-row" onClick={() => setSelected(i)}>
                    <Thumb item={entry} fallbackIcon={copy.icon} />
                    <span className="recog-row-text">
                      <span className="recog-row-title">{entry.title}</span>
                      <span className="recog-row-detail">{entry.detail}</span>
                    </span>
                    <span className="recog-row-index" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
