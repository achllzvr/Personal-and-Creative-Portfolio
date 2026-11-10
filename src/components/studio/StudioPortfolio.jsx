import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { site } from '../../data/site'
import {
  about,
  achievements,
  certifications,
  contact,
  contactBands,
  contactPhotos,
  experience,
  navItems,
  phaseWeights,
  projects,
} from '../../data/studioContent'
import { BrandMark } from './BrandMark'
import ProjectCaseModal from './ProjectCaseModal'
import RecognitionModal from './RecognitionModal'
import { SolarIcon } from './SolarDuotoneIcons'
import { TechIcon, techIconName, socialIconName } from './TechIcons'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_IN_OUT = 'cubic-bezier(0.45, 0.05, 0.25, 1)'
const AUTO_MS = 3400
const STACK_SPEED = 28 // px/s

function pad(n) {
  return String(n).padStart(2, '0')
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduce
}

function useAutoIndex(length, enabled, interval = AUTO_MS) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!enabled || length < 2) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % length), interval)
    return () => clearInterval(id)
  }, [enabled, length, interval])
  return [index, setIndex]
}

function resolvePhase(progress) {
  const entries = Object.entries(phaseWeights)
  const lastId = entries[entries.length - 1][0]
  let cursor = 0
  for (const [id, weight] of entries) {
    const next = cursor + weight
    const isLast = id === lastId
    if (progress < next || isLast) {
      const local = weight === 0 ? 0 : clamp((progress - cursor) / weight, 0, 1)
      return { id, local, start: cursor, end: next }
    }
    cursor = next
  }
  return { id: 'about', local: 0, start: 0, end: phaseWeights.about }
}

function phaseStart(id) {
  let cursor = 0
  for (const [key, weight] of Object.entries(phaseWeights)) {
    if (key === id) return cursor
    cursor += weight
  }
  return 0
}

function AccentDot() {
  return <span className="accent-dot" aria-hidden="true" />
}

const SWAP_OUT_MS = 340

/**
 * Cross-fade swap. When the key changes, the previous content stays in place and
 * fades out while the new content eases in (fade + gentle rise) — never a hard cut,
 * so rapid scrolling reads as a soft blend instead of a flicker.
 */
function FadeSwap({ swapKey, shade = 0, className = '', children }) {
  const last = useRef({ key: swapKey, node: children })
  const [leaving, setLeaving] = useState(null)

  useLayoutEffect(() => {
    if (last.current.key !== swapKey) setLeaving(last.current)
    last.current = { key: swapKey, node: children }
  })

  useEffect(() => {
    if (!leaving) return undefined
    const t = window.setTimeout(() => setLeaving(null), SWAP_OUT_MS + 60)
    return () => window.clearTimeout(t)
  }, [leaving])

  return (
    <div className={`swap-scene ${className}`.trim()} data-shade={shade % 3}>
      {leaving ? (
        <div
          key={`out-${leaving.key}`}
          className="swap-face swap-face--out"
          aria-hidden="true"
          ref={(el) => el?.setAttribute('inert', '')}
        >
          {leaving.node}
        </div>
      ) : null}
      <div key={swapKey} className="swap-face">
        {children}
      </div>
    </div>
  )
}

function Polaroid({ item, style }) {
  const [failed, setFailed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const show = Boolean(item.src) && !failed
  const enlarged = pinned || hovered

  return (
    <figure
      className={`polaroid${show ? ' polaroid--photo' : ' polaroid--slot'}${enlarged ? ' polaroid--enlarged' : ''}${pinned ? ' polaroid--pinned' : ''}`}
      style={{
        '--tilt': `${item.rotate || 0}deg`,
        '--w': item.w || undefined,
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        setPinned((v) => !v)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setPinned((v) => !v)
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={pinned}
      aria-label={pinned || hovered ? `Shrink ${item.alt || 'photo'}` : `Enlarge ${item.alt || 'photo'}`}
    >
      {show ? (
        <img src={item.src} alt={item.alt || ''} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <div className="polaroid-empty">
          <span>+</span>
          <small>Photo slot</small>
        </div>
      )}
    </figure>
  )
}

/**
 * One line per section, split into N segments (experiences / projects)
 * so remaining scroll beats stay visible.
 */
function ScrollIndicator({ index = 0, total = 1, itemProgress = 0, value, label }) {
  const segments = Math.max(1, total)
  const active = clamp(index, 0, segments - 1)
  const fillInActive =
    value != null && total <= 1 ? clamp(value, 0, 1) : clamp(itemProgress, 0, 1)
  const overall = clamp((active + fillInActive) / segments, 0, 1)

  return (
    <div
      className="rail-progress rail-progress--segments"
      role="progressbar"
      aria-valuenow={Math.round(overall * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Scroll progress'}
    >
      {Array.from({ length: segments }, (_, i) => {
        let fill = 0
        if (i < active) fill = 1
        else if (i === active) fill = fillInActive
        return (
          <div
            key={i}
            className={`rail-seg${i < active ? ' is-done' : i === active ? ' is-active' : ' is-todo'}`}
          >
            <span style={{ width: `${fill * 100}%` }} />
          </div>
        )
      })}
    </div>
  )
}

function RailHead({ label, index, total, onPrev, onNext }) {
  return (
    <div className="rail-head">
      <p>{label}</p>
      <div className="rail-controls">
        <span>
          {pad(index + 1)} / {pad(total)}
        </span>
        <button type="button" onClick={onPrev} aria-label="Previous">
          ←
        </button>
        <button type="button" onClick={onNext} aria-label="Next">
          →
        </button>
      </div>
    </div>
  )
}

/** Dots for an auto-looping carousel — current position at a glance. */
function LoopIndicator({ index, total, label, onSelect }) {
  const count = Math.max(1, total)
  const current = clamp(index, 0, count - 1)
  return (
    <div
      className="loop-indicator"
      role="group"
      aria-label={`${label}: ${current + 1} of ${count}`}
    >
      <div className="loop-dots">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`loop-dot${i === current ? ' is-active' : ''}${i < current ? ' is-passed' : ''}`}
            aria-label={`${label} ${i + 1} of ${count}`}
            aria-current={i === current ? 'true' : undefined}
            onClick={() => onSelect?.(i)}
          />
        ))}
      </div>
    </div>
  )
}

function StackMarquee({ items, active }) {
  const reduce = usePrefersReducedMotion()
  const trackRef = useRef(null)
  const offset = useRef(0)

  useEffect(() => {
    offset.current = 0
    if (trackRef.current) trackRef.current.style.transform = 'translateX(0)'
  }, [items])

  useEffect(() => {
    if (!active || reduce || items.length < 2) return undefined
    let frame = 0
    let last = performance.now()
    const tick = (now) => {
      const dt = (now - last) / 1000
      last = now
      offset.current -= STACK_SPEED * dt
      const el = trackRef.current
      if (el) {
        const half = el.scrollWidth / 2
        if (half > 0 && -offset.current >= half) offset.current += half
        el.style.transform = `translateX(${offset.current}px)`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, reduce, items])

  const loop = items.length ? [...items, ...items] : items

  return (
    <div className="stack-marquee" aria-label="Project tech stack">
      <div className="stack-marquee-track" ref={trackRef}>
        {loop.map((tech, i) => (
          <span key={`${tech}-${i}`} className="stack-chip">
            <TechIcon name={techIconName(tech)} />
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}

function splitTitle(title = '') {
  const parts = String(title).split(/\s+&\s+/)
  if (parts.length >= 2) {
    return { lead: `${parts[0]} &`, tail: parts.slice(1).join(' & ') }
  }
  const words = String(title).split(/\s+/)
  if (words.length >= 3) {
    return { lead: words.slice(0, Math.ceil(words.length / 2)).join(' '), tail: words.slice(Math.ceil(words.length / 2)).join(' ') }
  }
  return { lead: title, tail: '' }
}

function AboutView({ active, sectionProgress }) {
  const reduce = usePrefersReducedMotion()
  // 'awards' | 'certifications' while the click-through list is open
  const [recogOpen, setRecogOpen] = useState(null)
  const looping = active && !reduce && !recogOpen
  const [achIndex, setAchIndex] = useAutoIndex(achievements.length, looping, AUTO_MS)
  const [certIndex, setCertIndex] = useAutoIndex(certifications.length, looping, AUTO_MS + 400)
  const closeRecog = useCallback(() => setRecogOpen(null), [])
  const openOnKey = (kind) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setRecogOpen(kind)
    }
  }
  const achievement = achievements[achIndex] || achievements[0]
  const certification = certifications[certIndex] || certifications[0]
  const total = Math.max(achievements.length, certifications.length, 1)
  const pairIndex = Math.max(achIndex, certIndex) % total

  return (
    <div className="view about-view">
      <div className="split">
        <figure className="portrait-card morph-card">
          <img src={about.portrait} alt={site.name} />
          <figcaption>{about.caption}</figcaption>
        </figure>
        <div className="copy">
          <p className="kicker">{about.kicker}</p>
          <h1>
            {about.nameLead}
            <br />
            {about.nameTail}
          </h1>
          <p className="role">{about.role}</p>
          <p className="body">{about.body}</p>
          <ul className="tags">
            {about.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rail">
        <RailHead
          label={about.railLabel}
          index={pairIndex}
          total={total}
          onPrev={() => {
            setAchIndex((i) => (i - 1 + achievements.length) % achievements.length)
            setCertIndex((i) => (i - 1 + certifications.length) % certifications.length)
          }}
          onNext={() => {
            setAchIndex((i) => (i + 1) % achievements.length)
            setCertIndex((i) => (i + 1) % certifications.length)
          }}
        />
        <div className="rail-grid rail-grid--2 recognition-grid">
          <div className="recognition-col">
            <p className="recognition-label">Awards</p>
            <FadeSwap swapKey={`ach-${achIndex}`} shade={achIndex} className="swap-mini">
              <article
                className="mini mini--clickable"
                role="button"
                tabIndex={0}
                aria-label="View all awards"
                onClick={() => setRecogOpen('awards')}
                onKeyDown={openOnKey('awards')}
              >
                {achievement?.image ? (
                  <img src={achievement.image} alt="" />
                ) : (
                  <div className="mini-icon" aria-hidden="true">
                    <SolarIcon name="award" />
                  </div>
                )}
                <div>
                  <h3>{achievement?.title}</h3>
                  <p>{achievement?.detail}</p>
                </div>
                <span className="mini-more" aria-hidden="true">↗</span>
              </article>
            </FadeSwap>
            <LoopIndicator
              index={achIndex}
              total={achievements.length}
              label="Awards"
              onSelect={setAchIndex}
            />
          </div>
          <div className="recognition-col">
            <p className="recognition-label">Certifications</p>
            <FadeSwap swapKey={`cert-${certIndex}`} shade={certIndex + 1} className="swap-mini">
              <article
                className="mini mini--clickable"
                role="button"
                tabIndex={0}
                aria-label="View all certifications"
                onClick={() => setRecogOpen('certifications')}
                onKeyDown={openOnKey('certifications')}
              >
                {certification?.image ? (
                  <img src={certification.image} alt="" />
                ) : (
                  <div className="mini-icon" aria-hidden="true">
                    <SolarIcon name={certification?.icon || 'certificate'} />
                  </div>
                )}
                <div>
                  <p className="mini-eyebrow">{certification?.eyebrow || 'Certification'}</p>
                  <h3>{certification?.title}</h3>
                  <p>{certification?.detail}</p>
                </div>
                <span className="mini-more" aria-hidden="true">↗</span>
              </article>
            </FadeSwap>
            <LoopIndicator
              index={certIndex}
              total={certifications.length}
              label="Certifications"
              onSelect={setCertIndex}
            />
          </div>
        </div>
        <ScrollIndicator
          total={1}
          index={0}
          value={sectionProgress}
          label="Scroll progress to Experience"
        />
      </div>

      <RecognitionModal
        kind={recogOpen}
        items={recogOpen === 'certifications' ? certifications : achievements}
        open={Boolean(recogOpen)}
        onClose={closeRecog}
      />
    </div>
  )
}

function ExperienceView({ index, itemProgress, onStep }) {
  const roles = experience.roles
  // Content follows the scroll position directly; each change simply fades up (see .fade-swap).
  const contentIndex = index
  const role = roles[contentIndex] || roles[0]
  const upcoming = [1, 2, 3]
    .map((offset) => roles[(contentIndex + offset) % roles.length])
    .filter(Boolean)
  const showPositionHeading = contentIndex > 0
  const split = splitTitle(role.title)

  return (
    <div className="view experience-view">
      <div className="split">
            <FadeSwap swapKey={`role-card-${contentIndex}`} shade={contentIndex} className="swap-feature">
              <article
                className="feature-card"
                style={{
                  '--brand': role.brandColor,
                  background: `linear-gradient(160deg, color-mix(in srgb, ${role.brandColor} 18%, var(--card)) 0%, var(--card) 55%)`,
                }}
              >
                <header>
                  <p>{role.org}</p>
                  <BrandMark
                    logo={role.logo}
                    mark={role.mark}
                    color={role.brandColor}
                    label={role.org}
                    size="sm"
                  />
                </header>
                <p className="feature-year">{role.year}</p>
                <h2>{role.title}</h2>
                <footer>
                  <p>{role.foot}</p>
                  <AccentDot />
                </footer>
              </article>
            </FadeSwap>
            <FadeSwap swapKey={`role-copy-${contentIndex}`} shade={contentIndex + 1} className="swap-copy">
              <div className="copy">
                <p className="kicker">
                  {experience.kicker}
                  <span className="kicker-split">  ·  {role.categoryLabel}</span>
                </p>
                {showPositionHeading ? (
                  <h2 className="display">
                    {split.lead}
                    {split.tail ? (
                      <>
                        <br />
                        {split.tail}
                      </>
                    ) : null}
                  </h2>
                ) : (
                  <h2 className="display">
                    {experience.headlineLead}
                    <br />
                    {experience.headlineTail}
                  </h2>
                )}
                <div className="org-brand-row">
                  <BrandMark
                    logo={role.logo}
                    mark={role.mark}
                    color={role.brandColor}
                    label={role.org}
                    size="md"
                  />
                  <div>
                    <p className="role-line">
                      <strong>{role.title}</strong>
                      <span className="year-pill">{role.year}</span>
                    </p>
                    <p className="org-line">{role.org}</p>
                  </div>
                </div>
                <p className="body">{role.body}</p>
                <p className="tag-line">
                  <AccentDot /> {role.tag}
                </p>
              </div>
            </FadeSwap>
      </div>

      <div className="rail">
        <RailHead
          label={role.category === 'work' ? 'Work  /  Upcoming' : 'Academic  /  Upcoming'}
          index={index}
          total={roles.length}
          onPrev={() => onStep(-1)}
          onNext={() => onStep(1)}
        />
        <div className="journey-rail" aria-label="Upcoming experience roles">
          <div className="journey-rail-track">
            {upcoming.map((item, i) => (
              <FadeSwap
                key={i}
                swapKey={`${item.year}-${item.title}-${item.org}`}
                shade={i}
                className="journey-item"
              >
                <div className={`journey${i === 0 ? ' journey--next' : ''}`}>
                  <div className="journey-top">
                    <p className="journey-year">
                      <span className="journey-cat">{item.categoryLabel}</span>
                      {item.year}
                    </p>
                    <BrandMark
                      logo={item.logo}
                      mark={item.mark}
                      color={item.brandColor}
                      label={item.org}
                      size="xs"
                    />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.org}</p>
                </div>
              </FadeSwap>
            ))}
          </div>
        </div>
        <ScrollIndicator
          index={index}
          total={roles.length}
          itemProgress={itemProgress}
          label="Scroll progress through experience"
        />
      </div>
    </div>
  )
}

function ProjectCard({ project, index, onOpen }) {
  return (
    <article
      className="feature-card feature-card--project feature-card--clickable"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      aria-label={`Open ${project.title} case study`}
      style={{
        '--brand': project.brandColor,
        background: `linear-gradient(160deg, color-mix(in srgb, ${project.brandColor} 22%, var(--card)) 0%, var(--card) 58%)`,
      }}
    >
      <header>
        <p>Selected project</p>
        <span>{pad(index + 1)}</span>
      </header>
      <div className="project-hero-mark">
        {project.logo ? (
          <BrandMark
            logo={project.logo}
            mark={project.markText}
            color={project.brandColor}
            label={project.title}
            size="xl"
          />
        ) : (
          <p className="project-mark" style={{ color: project.brandColor }}>
            {project.markText}
          </p>
        )}
      </div>
      <p className="project-word">{project.word}</p>
      <footer>
        <p>View case study</p>
        <AccentDot />
      </footer>
    </article>
  )
}

function ProjectListRow({ item, ordinal, emphasis = 0 }) {
  // emphasis 1 = current, 0 = far — morph size/opacity instead of hard class snaps
  const t = clamp(emphasis, 0, 1)
  return (
    <div
      className="project-entry"
      style={{
        '--emph': t,
        opacity: 0.38 + t * 0.62,
      }}
    >
      <div className="project-entry-main">
        <BrandMark
          logo={item.logo}
          mark={item.markText}
          color={item.brandColor}
          label={item.title}
          size="sm"
        />
        <div>
          <h2>{item.title}</h2>
          <p>{item.subtitle}</p>
          <span className="quiet">{item.hrefLabel}</span>
        </div>
      </div>
      <span className="project-index">{pad(ordinal)}</span>
    </div>
  )
}

function ProjectsView({ index, scrollOffset, itemProgress, active, onStep }) {
  const items = projects.items
  const reduce = usePrefersReducedMotion()
  const [caseOpen, setCaseOpen] = useState(false)
  const [cardIndex, setCardIndex] = useState(index)
  const pendingRef = useRef(index)
  const promoteTimer = useRef(0)

  // List tracks scroll continuously; selected card follows after a short settle.
  // Rest on whole rows: the list only travels during the last stretch of each item's scroll range,
  // so a settled view always shows the current project at the top (never half-way between two).
  const raw = clamp(scrollOffset ?? index + itemProgress, 0, items.length - 1)
  const whole = Math.floor(raw)
  const t = clamp((raw - whole - 0.6) / 0.4, 0, 1)
  const offset = reduce ? index : whole + t * t * (3 - 2 * t)

  useEffect(() => {
    if (index === pendingRef.current) return undefined
    pendingRef.current = index

    if (reduce) {
      setCardIndex(index)
      return undefined
    }

    window.clearTimeout(promoteTimer.current)
    // Let the list lead; promote the selected card once motion settles.
    promoteTimer.current = window.setTimeout(() => {
      setCardIndex(index)
    }, 160)

    return () => window.clearTimeout(promoteTimer.current)
  }, [index, reduce])

  const project = items[cardIndex] || items[0]
  const openCase = () => setCaseOpen(true)
  const closeCase = () => setCaseOpen(false)

  useEffect(() => {
    // Close only when the selected project actually changes while open
    setCaseOpen(false)
  }, [cardIndex])

  return (
    <div className="view projects-view">
      <div className="split">
        <FadeSwap swapKey={`proj-card-${project.id}`} shade={cardIndex} className="swap-feature">
          <ProjectCard project={project} index={cardIndex} onOpen={openCase} />
        </FadeSwap>

        <div className="copy project-list">
          <p className="kicker">{projects.kicker}</p>
          <div className="project-list-viewport" aria-label="All projects">
            <div
              className="project-list-track"
              style={{
                transform: `translate3d(0, calc(-${offset} * var(--project-row-h)), 0)`,
              }}
            >
              {items.map((item, i) => {
                const dist = Math.abs(i - offset)
                const emphasis = clamp(1 - dist, 0, 1)
                return (
                  <div
                    key={item.id}
                    className={`project-list-slot${i === index ? ' is-current' : ''}${i === cardIndex ? ' is-selected' : ''}`}
                  >
                    <ProjectListRow item={item} ordinal={i + 1} emphasis={emphasis} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rail">
        <RailHead
          label={projects.railLabel}
          index={index}
          total={items.length}
          onPrev={() => onStep(-1)}
          onNext={() => onStep(1)}
        />
        <div className="stack-panel">
          <div className="stack-meta">
            <BrandMark
              logo={project.logo}
              mark={project.markText}
              color={project.brandColor}
              label={project.title}
              size="sm"
            />
            <div>
              <h3>{project.title}</h3>
              <p>Live tech stack for this project</p>
            </div>
          </div>
          <StackMarquee items={project.stack} active={active} />
        </div>
        <ScrollIndicator
          index={index}
          total={items.length}
          itemProgress={itemProgress}
          label="Scroll progress through projects"
        />
      </div>

      <ProjectCaseModal project={project} open={caseOpen} onClose={closeCase} />
    </div>
  )
}

function ContactView() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!site.formspreeEndpoint) {
      setStatus('error')
      setError('Form endpoint is not configured yet.')
      return
    }
    setStatus('submitting')
    setError('')
    try {
      const res = await fetch(site.formspreeEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  // Mobile: every photo, flat (no tilt / no fixed width) in one slow marquee strip
  const mobileStrip = [...contactBands.top, ...contactBands.bottom].map((item) => ({
    ...item,
    w: undefined,
    rotate: 0,
  }))

  return (
    <div className="view contact-view">
      <header className="contact-intro">
        <p className="kicker">{contact.kicker}</p>
        <h2>
          {contact.titleLead}{' '}
          <br className="contact-br" />
          {contact.titleTail}
        </h2>
        <p className="body">{contact.lede}</p>
      </header>

      <div className="contact-stage">
        <div className="contact-scatter-field" aria-hidden="true">
          {contactPhotos.map((item, i) => (
            <Polaroid
              key={`scatter-${i}`}
              item={item}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
            />
          ))}
        </div>

        <form className="inquiry" onSubmit={onSubmit}>
          <div className="inquiry-row">
            <label>
              Name
              <input name="name" value={form.name} onChange={onChange} required autoComplete="name" />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="email"
              />
            </label>
          </div>
          <div className="inquiry-row">
            <label>
              Contact number
              <input name="phone" value={form.phone} onChange={onChange} autoComplete="tel" />
            </label>
            <label>
              Subject
              <input name="subject" value={form.subject} onChange={onChange} required />
            </label>
          </div>
          <label>
            Inquiry / Message
            <textarea name="message" rows={4} value={form.message} onChange={onChange} required />
          </label>
          <button type="submit" className="send" disabled={status === 'submitting'}>
            <span>
              {status === 'submitting' ? 'Sending…' : status === 'success' ? 'Sent — thank you' : 'Send inquiry'}
            </span>
            <span aria-hidden="true">↗</span>
          </button>
          {error ? <p className="form-note form-note--error">{error}</p> : null}
          <ul className="socials">
            {contact.socials.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <TechIcon name={socialIconName(link.label)} className="social-icon" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </form>
      </div>

      {/* Mobile-only compact strip — desktop uses the scatter field around the form */}
      <div className="contact-band--mobile" aria-label="Photos">
        <div className="contact-band-track">
          {mobileStrip.map((item, i) => (
            <Polaroid key={`m-${i}`} item={item} />
          ))}
          {mobileStrip.map((item, i) => (
            <div key={`m2-${i}`} className="contact-band-dup" aria-hidden="true">
              <Polaroid item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function StudioPortfolio() {
  const { isDark, toggleTheme } = useTheme()
  const reduce = usePrefersReducedMotion()
  const pinRef = useRef(null)
  const [progress, setProgress] = useState(0)

  const rolesLen = experience.roles.length || 1
  const projectsLen = projects.items.length || 1

  const trackUnits = useMemo(
    () => 1.15 + rolesLen * 0.85 + projectsLen * 0.85 + 1.2,
    [rolesLen, projectsLen],
  )

  const phase = useMemo(() => resolvePhase(progress), [progress])

  const roleExact = useMemo(() => {
    if (phase.id !== 'experience') return phase.id === 'about' ? 0 : rolesLen - 0.001
    return clamp(phase.local * rolesLen, 0, rolesLen - 0.0001)
  }, [phase, rolesLen])

  const roleIndex = useMemo(() => clamp(Math.floor(roleExact), 0, rolesLen - 1), [roleExact, rolesLen])
  const roleProgress = useMemo(() => roleExact - roleIndex, [roleExact, roleIndex])

  const projectExact = useMemo(() => {
    if (phase.id !== 'projects') return phase.id === 'contact' ? projectsLen - 0.001 : 0
    return clamp(phase.local * projectsLen, 0, projectsLen - 0.0001)
  }, [phase, projectsLen])

  const projectIndex = useMemo(
    () => clamp(Math.floor(projectExact), 0, projectsLen - 1),
    [projectExact, projectsLen],
  )
  const projectProgress = useMemo(() => projectExact - projectIndex, [projectExact, projectIndex])

  const aboutProgress = phase.id === 'about' ? phase.local : phase.id === 'experience' ? 1 : 0

  const footHint =
    phase.id === 'contact' ? "Let's connect ↓" : 'Scroll to explore ↓'

  useEffect(() => {
    const onScroll = () => {
      const el = pinRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      const traveled = clamp(-rect.top, 0, total)
      setProgress(total > 0 ? traveled / total : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const go = useCallback(
    (id) => {
      const el = pinRef.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      const top = el.offsetTop + (phaseStart(id) + 0.012) * total
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
    },
    [reduce],
  )

  const stepWithinPhase = useCallback(
    (phaseId, count, currentIndex, dir) => {
      const el = pinRef.current
      if (!el || count < 1) return
      const next = clamp(currentIndex + dir, 0, count - 1)
      if (next === currentIndex) return
      const total = el.offsetHeight - window.innerHeight
      const start = phaseStart(phaseId)
      const weight = phaseWeights[phaseId]
      const local = (next + 0.5) / count
      const top = el.offsetTop + (start + local * weight) * total
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
    },
    [reduce],
  )

  return (
    <div
      className="studio"
      ref={pinRef}
      style={{ '--studio-units': trackUnits, '--ease': EASE, '--ease-in-out': EASE_IN_OUT }}
    >
      <div className="studio-pin">
        <div className="studio-grid" aria-hidden="true" />
        <header className="studio-header">
          <div className="header-top">
            <a
              className="brand"
              href="#about"
              onClick={(e) => {
                e.preventDefault()
                go('about')
              }}
            >
              <strong>av.r</strong>
              <span>Portfolio</span>
              <AccentDot />
            </a>
            <div className="header-meta">
              <p>Personal  /  2026</p>
              <button
                type="button"
                className={`mode-toggle${isDark ? '' : ' mode-toggle--shine'}`}
                onClick={toggleTheme}
              >
                {isDark ? 'Light' : 'Blueprint'}
              </button>
            </div>
          </div>
          <nav className="nav" aria-label="Sections">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={phase.id === item.id ? 'is-active' : ''}
                aria-current={phase.id === item.id ? 'true' : undefined}
                onClick={() => go(item.id)}
              >
                {item.label}
                {phase.id === item.id ? <AccentDot /> : null}
              </button>
            ))}
          </nav>
        </header>

        <main className="studio-stage" aria-live="polite">
          <div
            className={`stage-layer${phase.id === 'about' ? ' is-active' : ''}`}
            aria-hidden={phase.id !== 'about'}
          >
            <AboutView active={phase.id === 'about'} sectionProgress={aboutProgress} />
          </div>
          <div
            className={`stage-layer${phase.id === 'experience' ? ' is-active' : ''}`}
            aria-hidden={phase.id !== 'experience'}
          >
            <ExperienceView
              index={roleIndex}
              itemProgress={roleProgress}
              onStep={(dir) => stepWithinPhase('experience', rolesLen, roleIndex, dir)}
            />
          </div>
          <div
            className={`stage-layer${phase.id === 'projects' ? ' is-active' : ''}`}
            aria-hidden={phase.id !== 'projects'}
          >
            <ProjectsView
              index={projectIndex}
              scrollOffset={projectExact}
              itemProgress={projectProgress}
              active={phase.id === 'projects'}
              onStep={(dir) => stepWithinPhase('projects', projectsLen, projectIndex, dir)}
            />
          </div>
          <div
            className={`stage-layer stage-layer--contact${phase.id === 'contact' ? ' is-active' : ''}`}
            aria-hidden={phase.id !== 'contact'}
          >
            <ContactView />
          </div>
        </main>

        <footer className={`section-foot${phase.id === 'contact' ? ' section-foot--bare' : ''}`}>
          <p>Achilles Vonn D. Rabina</p>
          <p className="section-foot-hint">{footHint}</p>
        </footer>
      </div>
    </div>
  )
}
