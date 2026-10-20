import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { asset } from '../../utils/assets'
import { cn } from '../../lib/utils'

const PLACEHOLDER = 'rgba(255, 255, 255, 0.12)'
const AMT_SLOPE = 0.02
const AMT_BASE = 0.05
const BASE_FPS = 60
const MAX_DT = 0.05
const SPEED_REFERENCE = 50
/** Stop RAF once layers are this close to target (px / deg) */
const SETTLE_EPS = 0.25

const DEFAULT_MOTION = {
  shiftX: 120,
  shiftY: 70,
  tiltX: 10,
  tiltY: 16,
  twist: 6,
}

function srcOf(v) {
  if (!v) return null
  if (typeof v === 'string') return v || null
  return v.src || null
}

function resolveSrc(v) {
  const src = srcOf(v)
  if (!src) return null
  if (src.startsWith('http') || src.startsWith('/') || src.startsWith(import.meta.env.BASE_URL)) {
    return src
  }
  return asset(src)
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v
}

function radiusFromPercent(w, h, pct) {
  return (Math.min(w, h) / 2) * clamp(pct, 0, 100) * 0.01
}

/**
 * Image Motion Trail — Originkit (Vite/JSX port).
 * `track="page"` follows the cursor across the whole viewport.
 * RAF only runs while settling or after pointer moves (no idle thrash).
 */
export default function ImageMotionTrail({
  image,
  background = 'transparent',
  copies = 4,
  itemWidth = 160,
  itemHeight = 160,
  rounded = 22,
  perspective = 84,
  speed = 48,
  fade = 32,
  hoverOut = 'reset',
  track = 'page',
  motion: motionProp,
  className,
  style,
  alt = '',
  active = true,
}) {
  const reduce = useReducedMotion()
  const live = active && !reduce
  const m = { ...DEFAULT_MOTION, ...(motionProp ?? {}) }

  const rootRef = useRef(null)
  const nodesRef = useRef([])
  const aimRef = useRef({ nx: 0, ny: 0 })
  const stateRef = useRef([])
  const dirtyRef = useRef(true)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const cfgRef = useRef({ copies, speed, m, hoverOut })
  cfgRef.current = { copies, speed, m, hoverOut }

  const count = Math.max(1, Math.round(copies))
  const itemW = Math.max(1, Math.round(itemWidth))
  const itemH = Math.max(1, Math.round(itemHeight))
  const radius = radiusFromPercent(itemW, itemH, rounded)

  const halfFov = (clamp(perspective, 1, 179) * Math.PI) / 360
  const perspectivePx = Math.round(itemH / 2 / Math.tan(halfFov))

  useEffect(() => {
    if (!live) return undefined

    const tick = (now) => {
      if (document.visibilityState !== 'visible') {
        rafRef.current = 0
        return
      }

      const dt = clamp((now - lastRef.current) / 1000, 0, MAX_DT)
      lastRef.current = now
      dirtyRef.current = false

      const { copies: n, speed: sp, m: mm } = cfgRef.current
      const total = Math.max(1, Math.round(n))
      const gain = Math.max(0, sp) / SPEED_REFERENCE

      const { nx, ny } = aimRef.current
      const tx = nx * mm.shiftX
      const ty = ny * mm.shiftY
      const trx = ny * mm.tiltX
      const tryy = nx * mm.tiltY
      const trz = nx * mm.twist

      const st = stateRef.current
      let settling = false

      for (let i = 0; i < total; i++) {
        const node = nodesRef.current[i]
        if (!node) continue
        if (!st[i]) st[i] = { x: 0, y: 0, rx: 0, ry: 0, rz: 0 }
        const s = st[i]

        const amt = clamp((AMT_SLOPE * i + AMT_BASE) * gain, 0, 1)
        const a = amt >= 1 ? 1 : 1 - (1 - amt) ** (dt * BASE_FPS)

        s.x += (tx - s.x) * a
        s.y += (ty - s.y) * a
        s.rx += (trx - s.rx) * a
        s.ry += (tryy - s.ry) * a
        s.rz += (trz - s.rz) * a

        if (
          Math.abs(tx - s.x) > SETTLE_EPS ||
          Math.abs(ty - s.y) > SETTLE_EPS ||
          Math.abs(trx - s.rx) > SETTLE_EPS ||
          Math.abs(tryy - s.ry) > SETTLE_EPS ||
          Math.abs(trz - s.rz) > SETTLE_EPS
        ) {
          settling = true
        }

        node.style.transform =
          `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) ` +
          `rotateX(${s.rx.toFixed(1)}deg) ` +
          `rotateY(${s.ry.toFixed(1)}deg) ` +
          `rotateZ(${s.rz.toFixed(1)}deg)`
      }

      if (settling || dirtyRef.current) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = 0
      }
    }

    const kick = () => {
      dirtyRef.current = true
      if (!rafRef.current) {
        lastRef.current = performance.now()
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    const onMove = (e) => {
      if (track === 'page') {
        const vw = window.innerWidth || 1
        const vh = window.innerHeight || 1
        aimRef.current.nx = clamp((e.clientX / vw) * 2 - 1, -1, 1)
        aimRef.current.ny = clamp((e.clientY / vh) * 2 - 1, -1, 1)
        kick()
        return
      }

      const root = rootRef.current
      if (!root) return
      const r = root.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) return
      aimRef.current.nx = ((e.clientX - r.left) / r.width) * 2 - 1
      aimRef.current.ny = ((e.clientY - r.top) / r.height) * 2 - 1
      kick()
    }

    const onLeave = () => {
      if (cfgRef.current.hoverOut !== 'reset') return
      aimRef.current.nx = 0
      aimRef.current.ny = 0
      kick()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') kick()
      else if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }

    if (track === 'page') {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave)
      document.addEventListener('mouseleave', onLeave)
    } else {
      const root = rootRef.current
      if (root) {
        root.addEventListener('pointermove', onMove)
        root.addEventListener('pointerleave', onLeave)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    kick()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (track === 'page') {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerleave', onLeave)
        document.removeEventListener('mouseleave', onLeave)
      } else {
        const root = rootRef.current
        if (root) {
          root.removeEventListener('pointermove', onMove)
          root.removeEventListener('pointerleave', onLeave)
        }
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [live, track])

  const src = resolveSrc(image)
  const fadeAmt = clamp(fade, 0, 100) / 100
  const layerCount = reduce ? 1 : count

  useEffect(() => {
    if (live) return
    const st = stateRef.current
    for (let i = 0; i < layerCount; i++) {
      const node = nodesRef.current[i]
      if (!node) continue
      if (!st[i]) st[i] = { x: 0, y: 0, rx: 0, ry: 0, rz: 0 }
      else {
        st[i].x = 0
        st[i].y = 0
        st[i].rx = 0
        st[i].ry = 0
        st[i].rz = 0
      }
      node.style.transform = 'translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg)'
      node.style.willChange = 'auto'
    }
  }, [live, layerCount])

  return (
    <div
      ref={rootRef}
      className={cn('relative grid place-items-center overflow-visible', className)}
      style={{
        width: itemW,
        height: itemH,
        background,
        ...style,
      }}
      aria-hidden={alt ? undefined : true}
    >
      <div
        className="grid place-items-center"
        style={{ perspective: `${perspectivePx}px` }}
      >
        {Array.from({ length: layerCount }, (_, i) => {
          const ramp = (i + 1) / layerCount
          const opacity = live ? 1 - fadeAmt * (1 - ramp) : i === layerCount - 1 ? 1 : 0
          const isTop = i === layerCount - 1

          return (
            <div
              key={i}
              ref={(node) => {
                nodesRef.current[i] = node
              }}
              style={{
                gridArea: '1 / 1 / 2 / 2',
                position: 'relative',
                width: itemW,
                height: itemH,
                borderRadius: radius,
                overflow: 'hidden',
                opacity,
                backgroundColor: src ? 'transparent' : PLACEHOLDER,
                willChange: live ? 'transform' : undefined,
                boxShadow: isTop ? '0 18px 40px rgba(0,0,0,0.28)' : undefined,
                backgroundImage: !isTop && src ? `url(${src})` : undefined,
                backgroundSize: !isTop && src ? 'cover' : undefined,
                backgroundPosition: !isTop && src ? 'center' : undefined,
              }}
            >
              {src && isTop ? (
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
