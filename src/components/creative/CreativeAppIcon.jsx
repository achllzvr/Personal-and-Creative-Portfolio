import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/utils'
import { asset } from '../../utils/assets'

/**
 * Squircle app icon with a light 3D float / tilt (CSS + motion, no R3F).
 */
export default function CreativeAppIcon({
  src,
  alt = '',
  size = 'md',
  floating = true,
  className,
}) {
  const reduce = useReducedMotion()
  const resolved =
    !src || src.startsWith('http') || src.startsWith('/') || src.startsWith(import.meta.env.BASE_URL)
      ? src
      : asset(src)

  const dim =
    size === 'lg' ? 'h-28 w-28 sm:h-36 sm:w-36' : size === 'sm' ? 'h-14 w-14' : 'h-20 w-20 sm:h-24 sm:w-24'

  return (
    <motion.div
      className={cn('relative shrink-0', dim, className)}
      style={{ perspective: 800 }}
      animate={
        floating && !reduce
          ? {
              y: [0, -10, 0],
              rotateY: [-8, 8, -8],
              rotateX: [4, -2, 4],
            }
          : { y: 0, rotateY: 0, rotateX: 0 }
      }
      transition={
        floating && !reduce
          ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }
      }
    >
      <div
        className="h-full w-full overflow-hidden rounded-[22%] shadow-[0_18px_40px_rgba(0,0,0,0.35)]
                   ring-1 ring-white/25"
        style={{
          transformStyle: 'preserve-3d',
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%)',
        }}
      >
        {resolved ? (
          <img
            src={resolved}
            alt={alt}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white">
            App
          </div>
        )}
      </div>
    </motion.div>
  )
}
