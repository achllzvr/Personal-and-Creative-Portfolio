import { cva } from 'class-variance-authority'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import { asset } from '../../utils/assets'

const DOCK_EASE = [0.16, 1, 0.3, 1]
const DOCK_DURATION = 0.5
/** Shared-element fly — ease-in-out, matched in CreativeHome */
const ICON_LAYOUT_EASE = [0.45, 0, 0.55, 1]
const ICON_LAYOUT_DURATION = 0.72

const DOCK_WIDTH = {
  base: '5rem',
  far: '6rem',
  close: '7rem',
  active: '8rem',
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
  'mb-0 flex list-none flex-row items-end justify-center p-0 text-[clamp(0.875rem,1.4vw,1.125rem)]',
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

const dockNavItemVariants = cva('relative flex items-center justify-center')

const dockNavLinkVariants = cva(
  'relative z-[1] flex h-full w-full cursor-pointer items-center justify-center border-0 bg-transparent px-[0.5em] py-0',
)

const dockNavIconVariants = cva('h-full w-full object-contain')

const dockNavTooltipVariants = cva(
  'pointer-events-none absolute top-0 z-0 whitespace-nowrap rounded-[0.25em] bg-neutral-100 px-[0.5em] py-[0.4em] font-normal text-[1em] text-neutral-900 dark:bg-neutral-800 dark:text-white',
)

function getItemWidth(index, hoveredIndex, reduceMotion) {
  if (reduceMotion || hoveredIndex === null) return DOCK_WIDTH.base

  const distance = Math.abs(index - hoveredIndex)
  if (distance === 0) return DOCK_WIDTH.active
  if (distance === 1) return DOCK_WIDTH.close
  if (distance === 2) return DOCK_WIDTH.far
  return DOCK_WIDTH.base
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

function DockNavItemIcon({ alt, icon, iconSrc, label, isSelected, layoutId, fadeIn, index }) {
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
    <motion.img
      layoutId={layoutId}
      alt={alt ?? label}
      className={cn(dockNavIconVariants(), 'rounded-[22%] object-cover')}
      height={64}
      src={src}
      width={64}
      draggable={false}
      initial={fadeIn ? { opacity: 0, scale: 0.85 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        layoutId
          ? {
              layout: {
                duration: ICON_LAYOUT_DURATION,
                ease: ICON_LAYOUT_EASE,
              },
              opacity: { duration: fadeIn ? 0.2 : 0 },
              scale: { duration: fadeIn ? 0.2 : 0 },
            }
          : fadeIn
            ? { duration: 0.2, delay: index * 0.02, ease: DOCK_EASE }
            : { duration: 0 }
      }
      style={layoutId ? { willChange: 'transform' } : undefined}
    />
  )
}

/**
 * Originkit DockNav — Vite/JSX port (width magnification + tooltip).
 * Keeps creative-portfolio hooks: onItemSelect, selectedId, shared layout, etc.
 */
export default function DockNav({
  align = 'center',
  className,
  duration = DOCK_DURATION,
  items,
  onItemSelect,
  selectedId = null,
  fadeInIcons = false,
  interactive = true,
  showMobileLabels = false,
  sharedLayout = true,
  ...props
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const prefersReducedMotion = useReducedMotion()

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration,
        ease: DOCK_EASE,
      }

  return (
    <nav className={cn(dockNavVariants({ align }), className)} {...props}>
      <ul className={dockNavListVariants({ align })}>
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index
          const isSelected = selectedId != null && selectedId === item.id
          const itemKey = `${item.label}-${item.id ?? item.href ?? index}`
          const hoverIndex = interactive ? hoveredIndex : null

          return (
            <motion.li
              animate={{
                width: getItemWidth(index, hoverIndex, prefersReducedMotion),
              }}
              className={dockNavItemVariants()}
              initial={false}
              key={itemKey}
              onMouseEnter={() => {
                if (interactive) setHoveredIndex(index)
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              transition={transition}
            >
              <button
                type="button"
                className={dockNavLinkVariants()}
                onClick={() => interactive && onItemSelect?.(item, index)}
                aria-label={item.label}
                aria-pressed={isSelected}
                disabled={!interactive}
              >
                <DockNavItemIcon
                  alt={item.alt}
                  icon={item.icon}
                  iconSrc={item.iconSrc}
                  label={item.label}
                  isSelected={isSelected}
                  layoutId={
                    sharedLayout && !fadeInIcons && !isSelected
                      ? `creative-icon-${item.id}`
                      : undefined
                  }
                  fadeIn={fadeInIcons && !prefersReducedMotion}
                  index={index}
                />
              </button>
              <motion.div
                animate={{
                  opacity: isHovered && !isSelected && interactive ? 1 : 0,
                  y: isHovered ? '-140%' : '-80%',
                }}
                className={cn(
                  dockNavTooltipVariants(),
                  showMobileLabels && 'hidden sm:block',
                )}
                initial={false}
                transition={transition}
              >
                <div>{item.label}</div>
              </motion.div>
              {showMobileLabels ? (
                <span className="pointer-events-none absolute left-1/2 top-full mt-1 max-w-[4.5rem] -translate-x-1/2 truncate text-center text-[0.65rem] leading-tight text-blue-900/80 dark:text-white/70 sm:hidden">
                  {item.label}
                </span>
              ) : null}
            </motion.li>
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
