import { motion, useReducedMotion } from 'motion/react'
import { asset } from '../../utils/assets'
import RollingLetters from './RollingLetters'
import TextEmerge from './TextEmerge'

const EASE = [0.22, 1, 0.36, 1]

export const SECTION_KEYS = [
  'chrome',
  'tagline',
  'badges',
  'overview',
  'gallery',
  'links',
  'tech',
]

export const SECTION_COUNT = SECTION_KEYS.length

function SectionShell({ visible, exiting, reduce, className, children }) {
  // Mount once when first revealed; stay mounted to avoid remount flicker
  if (!visible && !exiting) return null

  // On exit the parent stage fades as one layer — skip per-section tweens
  if (exiting) {
    return (
      <div className={className} style={{ pointerEvents: 'none' }}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.28, ease: EASE }}
      style={{ transform: 'translateZ(0)' }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Shells appear first; content stays mounted and plays in via `active`.
 */
export default function CreativeCaseStudy({
  work,
  containerStep = 0,
  contentStep = 0,
  exiting = false,
  onClose,
  backDisabled = false,
}) {
  const reduce = useReducedMotion()

  if (!work) return null

  const shell = (index) => containerStep > index
  // Keep content "filled" while exiting so letter/gallery tweens don't reverse under the stage fade
  const filled = (index) => exiting || contentStep > index

  return (
    <div className="mt-10 w-full space-y-8" aria-label={`${work.name} details`}>
      <SectionShell
        visible={shell(0)}
        exiting={exiting}
        reduce={reduce}
        className="flex min-h-[2.25rem] items-center justify-between gap-4"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={backDisabled || !filled(0)}
          className={`rounded-lg px-3 py-2 text-sm font-medium text-blue-900/80
                     transition hover:bg-blue-900/5 hover:text-blue-900
                     disabled:pointer-events-none
                     dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white
                     ${filled(0) ? '' : 'opacity-0'}`}
        >
          ← Back
        </button>
        <RollingLetters
          active={filled(0)}
          text={work.year || ''}
          tag="span"
          startFrom="bottom"
          staggerFrom="end"
          className="text-xs uppercase tracking-wider text-blue-900/50 dark:text-white/40"
          transition={{ duration: 0.4, staggerChildren: 0.025, ease: 'easeOut' }}
        />
      </SectionShell>

      <SectionShell visible={shell(1)} exiting={exiting} reduce={reduce}>
        <RollingLetters
          active={filled(1)}
          text={work.tagline || ''}
          tag="p"
          startFrom="bottom"
          staggerFrom="center"
          className="text-base text-blue-900/70 dark:text-white/65 sm:text-lg"
          transition={{ duration: 0.42, staggerChildren: 0.018, ease: 'easeOut' }}
        />
      </SectionShell>

      <SectionShell
        visible={shell(2)}
        exiting={exiting}
        reduce={reduce}
        className="flex min-h-[1.75rem] flex-wrap items-center gap-2"
      >
        {work.role ? (
          <RollingLetters
            active={filled(2)}
            text={work.role}
            tag="span"
            startFrom="bottom"
            staggerFrom="start"
            className="rounded-md bg-blue-900/8 px-2.5 py-1 text-xs font-medium text-blue-900 dark:bg-white/10 dark:text-white/85"
            transition={{ duration: 0.32, staggerChildren: 0.014 }}
          />
        ) : null}
        {work.status ? (
          <RollingLetters
            active={filled(2)}
            text={work.status}
            tag="span"
            startFrom="bottom"
            staggerFrom="start"
            className="rounded-md bg-blue-600/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-400/15 dark:text-blue-200"
            transition={{ duration: 0.32, delay: 0.05, staggerChildren: 0.014 }}
          />
        ) : null}
      </SectionShell>

      <SectionShell visible={shell(3)} exiting={exiting} reduce={reduce}>
        <section>
          <RollingLetters
            active={filled(3)}
            text="Overview"
            tag="h3"
            startFrom="bottom"
            staggerFrom="start"
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-900/50 dark:text-white/40"
            transition={{ duration: 0.3, staggerChildren: 0.025 }}
          />
          <TextEmerge
            active={filled(3)}
            text={work.description}
            tag="p"
            staggerFrom="start"
            className="text-base leading-relaxed text-blue-950/85 dark:text-white/80 sm:text-lg"
            transition={{ duration: 0.4, delay: 0.08, staggerChildren: 0.02, ease: 'easeOut' }}
          />
        </section>
      </SectionShell>

      {work.images?.length ? (
        <SectionShell visible={shell(4)} exiting={exiting} reduce={reduce}>
          <section>
            <RollingLetters
              active={filled(4)}
              text="Gallery"
              tag="h3"
              startFrom="bottom"
              staggerFrom="start"
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-900/50 dark:text-white/40"
              transition={{ duration: 0.3, staggerChildren: 0.025 }}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {work.images.map((src, i) => (
                <motion.div
                  key={src}
                  className="overflow-hidden rounded-2xl bg-blue-900/5 ring-1 ring-blue-900/10 dark:bg-white/5 dark:ring-white/10"
                  initial={false}
                  animate={
                    filled(4)
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 8 }
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.32, delay: filled(4) ? i * 0.07 : 0, ease: EASE }
                  }
                >
                  <img
                    src={asset(src)}
                    alt=""
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </section>
        </SectionShell>
      ) : null}

      {work.links?.length ? (
        <SectionShell visible={shell(5)} exiting={exiting} reduce={reduce}>
          <section>
            <RollingLetters
              active={filled(5)}
              text="Links"
              tag="h3"
              startFrom="bottom"
              staggerFrom="start"
              className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-900/50 dark:text-white/40"
              transition={{ duration: 0.3, staggerChildren: 0.025 }}
            />
            <ul className="flex flex-wrap gap-3">
              {work.links.map((link, i) => (
                <motion.li
                  key={`${link.label}-${link.href}`}
                  initial={false}
                  animate={
                    filled(5)
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 6 }
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.28, delay: filled(5) ? i * 0.05 : 0, ease: EASE }
                  }
                >
                  <a
                    href={link.href}
                    target={link.href?.startsWith('http') ? '_blank' : undefined}
                    rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white
                               transition hover:bg-blue-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90"
                    onClick={(e) => {
                      if (!link.href || link.href === '#') e.preventDefault()
                    }}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </section>
        </SectionShell>
      ) : null}

      {work.tech?.length ? (
        <SectionShell visible={shell(6)} exiting={exiting} reduce={reduce}>
          <section>
            <RollingLetters
              active={filled(6)}
              text="Tech"
              tag="h3"
              startFrom="bottom"
              staggerFrom="start"
              className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-900/50 dark:text-white/40"
              transition={{ duration: 0.3, staggerChildren: 0.025 }}
            />
            <TextEmerge
              active={filled(6)}
              text={work.tech.join(' · ')}
              tag="p"
              staggerFrom="start"
              className="text-sm text-blue-900/80 dark:text-white/75"
              transition={{ duration: 0.38, staggerChildren: 0.03, ease: 'easeOut' }}
            />
          </section>
        </SectionShell>
      ) : null}
    </div>
  )
}
