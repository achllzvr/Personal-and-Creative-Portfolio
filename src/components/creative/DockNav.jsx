import { cva } from 'class-variance-authority'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { asset } from '../../utils/assets'

const DOCK_EASE = [0.22, 1, 0.36, 1]
const DOCK_DURATION = 0.38

/** Scale-based magnification — transform-only, no width layout thrash */
const DOCK_SCALE = {
  base: 1,
  far: 1.12,
  close: 1.28,
  active: 1.45,
}

const dockNavVariants = cva('w-full', {
  variants: {
    align: {
      center: '',
      start: '',
      end: '',
    },
  },
  defaultVariants: {
    align: 'center',
  },
})

const dockNavListVariants = cva(
  'mb-0 flex list-none flex-row items-end justify-center gap-0 p-0 text-[clamp(0.875rem,1.4vw,1.125rem)]',
  {
    variants: {
      align: {
        center: 'justify-center',
        start: 'justify-start',
        end: 'justify-end',
      },
    },
    defaultVariants: {
      align: 'center',
    },
  },
)

const dockNavItemVariants = cva(
  'relative flex min-w-0 flex-1 items-end justify-center max-w-[3rem] sm:max-w-none sm:w-[5rem] sm:flex-none',
)

const dockNavLinkVariants = cva(
  'relative z-[1] flex aspect-square w-full cursor-pointer items-center justify-center border-0 bg-transparent p-[0.35em]',
)

const dockNavIconVariants = cva('h-full w-full object-contain')

const dockNavTooltipVariants = cva(
  'pointer-events-none absolute bottom-[115%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[0.25em] bg-neutral-100 px-[0.5em] py-[0.35em] font-normal text-[0.85em] text-neutral-900 dark:bg-neutral-800 dark:text-white',
)

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(hover: none), (pointer: coarse)').matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    const update = () => setCoarse(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return coarse
}

function getItemScale(index, hoveredIndex, reduceMotion) {
  if (reduceMotion || hoveredIndex === null) return DOCK_SCALE.base

  const distance = Math.abs(index - hoveredIndex)
  if (distance === 0) return DOCK_SCALE.active
  if (distance === 1) return DOCK_SCALE.close
  if (distance === 2) return DOCK_SCALE.far
  return DOCK_SCALE.base
}

function resolveIconSrc(iconSrc) {
  if (!iconSrc) return null
  if (
    iconSrc.startsWith('http') ||
    iconSrc.startsWith('/') ||
    iconSrc.startsWith(import.meta.env.BASE_URL)
  ) {
    return iconSrc
  }
  return asset(iconSrc)
}

function DockNavItemIcon({ alt, icon, iconSrc, label, isSelected }) {
  if (icon) {
    return <span className={dockNavIconVariants()}>{icon}</span>
  }

  const src = resolveIconSrc(iconSrc)
  if (!src) return null

  if (isSelected) {
    return (
      <span
        className="block aspect-square w-full rounded-[22%] bg-blue-900/10 dark:bg-white/10"
        aria-hidden
      />
    )
  }

  return (
    <img
      alt={alt ?? label}
      className={cn(dockNavIconVariants(), 'rounded-[22%] object-cover')}
      height={64}
      src={src}
      width={64}
      draggable={false}
      decoding="async"
    />
  )
}

/**
 * Originkit DockNav — scale-magnification port (smooth, no width layout).
 * Desktop: hover reveals name, click opens.
 * Touch: first tap reveals name + magnify, second tap opens.
 */
export default function DockNav({
  align = 'center',
  className,
  duration = DOCK_DURATION,
  items,
  onItemSelect,
  selectedId = null,
  interactive = true,
  showMobileLabels: _showMobileLabels = false,
  // retained for API compat; icon shared-layout morph removed (was janky)
  sharedLayout: _sharedLayout = false,
  fadeInIcons: _fadeInIcons = false,
  ...props
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [armedIndex, setArmedIndex] = useState(null)
  const prefersReducedMotion = useReducedMotion()
  const isCoarse = useCoarsePointer()

  useEffect(() => {
    if (!interactive) {
      setArmedIndex(null)
      setHoveredIndex(null)
    }
  }, [interactive])

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration,
        ease: DOCK_EASE,
      }

  const focusIndex = isCoarse ? armedIndex : hoveredIndex

  return (
    <nav className={cn(dockNavVariants({ align }), className)} {...props}>
      <ul className={dockNavListVariants({ align })}>
        {items.map((item, index) => {
          const isFocused = focusIndex === index
          const isSelected = selectedId != null && selectedId === item.id
          const itemKey = `${item.label}-${item.id ?? item.href ?? index}`
          const scale = getItemScale(index, focusIndex, prefersReducedMotion)

          return (
            <li
              className={dockNavItemVariants()}
              key={itemKey}
              onMouseEnter={() => {
                if (interactive && !isCoarse) setHoveredIndex(index)
              }}
              onMouseLeave={() => {
                if (!isCoarse) setHoveredIndex(null)
              }}
            >
              <motion.div
                className="flex w-full origin-bottom flex-col items-center"
                animate={{ scale }}
                initial={false}
                transition={transition}
                style={{
                  zIndex: isFocused ? 2 : 1,
                  willChange: focusIndex != null ? 'transform' : 'auto',
                }}
              >
                <button
                  type="button"
                  className={dockNavLinkVariants()}
                  onClick={() => {
                    if (!interactive) return
                    if (isCoarse) {
                      if (armedIndex === index) {
                        setArmedIndex(null)
                        onItemSelect?.(item, index)
                      } else {
                        setArmedIndex(index)
                      }
                      return
                    }
                    onItemSelect?.(item, index)
                  }}
                  aria-label={item.label}
                  aria-pressed={isSelected}
                  aria-expanded={isCoarse ? armedIndex === index : undefined}
                  disabled={!interactive}
                >
                  <DockNavItemIcon
                    alt={item.alt}
                    icon={item.icon}
                    iconSrc={item.iconSrc}
                    label={item.label}
                    isSelected={isSelected}
                  />
                </button>
                {isFocused && !isSelected && interactive ? (
                  <motion.div
                    className={dockNavTooltipVariants()}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.18, ease: DOCK_EASE }
                    }
                  >
                    {item.label}
                  </motion.div>
                ) : null}
              </motion.div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export {
  DockNav,
  dockNavIconVariants,
  dockNavItemVariants,
  dockNavLinkVariants,
  dockNavListVariants,
  dockNavTooltipVariants,
  dockNavVariants,
}
