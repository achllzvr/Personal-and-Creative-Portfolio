import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/utils'

const CELL_SIZE = 56
const MAX_PULSES = 22
const MIN_SEGMENTS = 5
const MAX_SEGMENTS = 14
const SPAWN_MIN_MS = 50
const SPAWN_MAX_MS = 140
const BURST_ON_START = 12
const PULSE_DURATION_MIN_MS = 1800
const PULSE_DURATION_MAX_MS = 3200
/** Visible snake body length in px — stays coherent while turning corners */
const SNAKE_LEN_MIN = 48
const SNAKE_LEN_MAX = 96

const DIRS = [
  { dc: 1, dr: 0 },
  { dc: -1, dr: 0 },
  { dc: 0, dr: 1 },
  { dc: 0, dr: -1 },
]

const GRID_MASK =
  '[mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]'

/**
 * Aceternity-style cell grid.
 * Ripples from any page click (maps coordinates → cell) so UI on top still triggers it.
 * Ambient circuit snakes travel along grid edges independently of click ripples.
 * @see https://ui.aceternity.com/components/background-ripple-effect
 */
export function BackgroundRippleEffect({
  rows: rowsProp,
  cols: colsProp,
  cellSize = CELL_SIZE,
}) {
  const [clickedCell, setClickedCell] = useState(null)
  const [rippleKey, setRippleKey] = useState(0)
  const [grid, setGrid] = useState(() => ({
    rows: rowsProp ?? 14,
    cols: colsProp ?? 30,
  }))

  useEffect(() => {
    if (rowsProp != null && colsProp != null) {
      setGrid({ rows: rowsProp, cols: colsProp })
      return undefined
    }

    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setGrid({
        cols: Math.max(12, Math.ceil(w / cellSize) + 2),
        rows: Math.max(8, Math.ceil(h / cellSize) + 2),
      })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [rowsProp, colsProp, cellSize])

  // Global clicks → ripple at the cell under the cursor (works through overlays/cards)
  useEffect(() => {
    const { rows, cols } = grid

    const onPointerDown = (e) => {
      if (e.button != null && e.button !== 0) return

      const gridW = cols * cellSize
      const gridH = rows * cellSize
      const offsetX = (window.innerWidth - gridW) / 2
      const offsetY = 0
      const x = e.clientX - offsetX
      const y = e.clientY - offsetY

      if (x < 0 || y < 0 || x >= gridW || y >= gridH) return

      const col = Math.min(cols - 1, Math.floor(x / cellSize))
      const row = Math.min(rows - 1, Math.floor(y / cellSize))

      setClickedCell({ row, col })
      setRippleKey((k) => k + 1)
    }

    document.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [grid, cellSize])

  const gridW = grid.cols * cellSize
  const gridH = grid.rows * cellSize

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full overflow-hidden',
        /* Light — base #e8f0fd (stronger blue so tiles read clearly) */
        '[--cell-border-color:rgba(37,99,235,0.42)]',
        '[--cell-fill-color:rgba(96,165,250,0.55)]',
        '[--cell-shadow-color:rgba(37,99,235,0.28)]',
        '[--circuit-stroke:rgba(37,99,235,0.9)]',
        '[--circuit-stroke-soft:rgba(96,165,250,0.7)]',
        /* Dark — base #0d1535 */
        'dark:[--cell-border-color:rgba(148,163,184,0.28)]',
        'dark:[--cell-fill-color:rgba(26,42,94,0.65)]',
        'dark:[--cell-shadow-color:rgba(59,130,246,0.28)]',
        'dark:[--circuit-stroke:rgba(191,219,254,0.95)]',
        'dark:[--circuit-stroke-soft:rgba(147,197,253,0.65)]',
      )}
      aria-hidden="true"
    >
      <div className="relative h-full w-full overflow-hidden">
        <DivGrid
          key={`base-${rippleKey}`}
          className={cn('opacity-95 dark:opacity-80', GRID_MASK)}
          rows={grid.rows}
          cols={grid.cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
        />
        <CircuitTraces
          rows={grid.rows}
          cols={grid.cols}
          cellSize={cellSize}
          width={gridW}
          height={gridH}
        />
      </div>
    </div>
  )
}

function DivGrid({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = '#3f3f46',
  fillColor = 'rgba(14,165,233,0.3)',
  clickedCell = null,
}) {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  )

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: 'auto',
  }

  return (
    <div className={cn('relative z-[3]', className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols)
        const colIdx = idx % cols
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0
        const delay = clickedCell ? Math.max(0, distance * 55) : 0
        const duration = 200 + distance * 80

        const style = {
          backgroundColor: fillColor,
          borderColor,
          ...(clickedCell
            ? {
                '--delay': `${delay}ms`,
                '--duration': `${duration}ms`,
              }
            : null),
        }

        return (
          <div
            key={idx}
            className={cn(
              'cell relative border-[0.5px] opacity-55 dark:opacity-40 will-change-transform',
              'shadow-[0px_0px_28px_1px_var(--cell-shadow-color)_inset] dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]',
              clickedCell && 'animate-cell-ripple',
            )}
            style={style}
          />
        )
      })}
    </div>
  )
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/**
 * Random orthogonal walk along grid vertices so the stroke sits on cell borders.
 */
function buildSnakePath(rows, cols, cellSize) {
  let c = randInt(0, cols)
  let r = randInt(0, rows)
  const points = [{ x: c * cellSize, y: r * cellSize }]
  const segments = randInt(MIN_SEGMENTS, MAX_SEGMENTS)
  let lastDir = null

  for (let i = 0; i < segments; i++) {
    const candidates = DIRS.filter((d) => {
      // Prefer continuing / turning; never reverse immediately
      if (lastDir && d.dc === -lastDir.dc && d.dr === -lastDir.dr) return false
      const nc = c + d.dc
      const nr = r + d.dr
      return nc >= 0 && nc <= cols && nr >= 0 && nr <= rows
    })
    if (!candidates.length) break

    // Bias toward continuing straight so the path reads as a flowing trace
    let dir
    if (lastDir && Math.random() < 0.55) {
      const straight = candidates.find(
        (d) => d.dc === lastDir.dc && d.dr === lastDir.dr,
      )
      dir = straight ?? candidates[randInt(0, candidates.length - 1)]
    } else {
      dir = candidates[randInt(0, candidates.length - 1)]
    }

    c += dir.dc
    r += dir.dr
    lastDir = dir
    points.push({ x: c * cellSize, y: r * cellSize })
  }

  if (points.length < 3) return null

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`)
    .join(' ')
  const length = (points.length - 1) * cellSize
  return { d, length }
}

function createPulse(rows, cols, cellSize, id) {
  const path = buildSnakePath(rows, cols, cellSize)
  if (!path) return null

  const snakePx = randInt(SNAKE_LEN_MIN, SNAKE_LEN_MAX)
  // Normalize to pathLength=100 so CSS dash travel is reliable
  const snakeUnits = Math.max(4, Math.min(28, (snakePx / path.length) * 100))
  const duration = randInt(PULSE_DURATION_MIN_MS, PULSE_DURATION_MAX_MS)

  return {
    id,
    d: path.d,
    snakeUnits,
    duration,
    soft: Math.random() > 0.45,
    strokeWidth: Math.random() > 0.5 ? 1.5 : 1.25,
  }
}

function CircuitTraces({ rows, cols, cellSize, width, height }) {
  const [pulses, setPulses] = useState([])
  const idRef = useRef(0)
  const pulsesRef = useRef([])
  const removeTimersRef = useRef(new Map())
  const reducedMotionRef = useRef(false)

  const syncPulses = (next) => {
    pulsesRef.current = next
    setPulses(next)
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mq.matches
    const onChange = () => {
      reducedMotionRef.current = mq.matches
      if (mq.matches) {
        removeTimersRef.current.forEach((t) => clearTimeout(t))
        removeTimersRef.current.clear()
        syncPulses([])
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let cancelled = false
    let spawnTimer = null

    const clearSpawn = () => {
      if (spawnTimer != null) {
        clearTimeout(spawnTimer)
        spawnTimer = null
      }
    }

    const clearRemoves = () => {
      removeTimersRef.current.forEach((t) => clearTimeout(t))
      removeTimersRef.current.clear()
    }

    const armRemove = (id, duration) => {
      const prev = removeTimersRef.current.get(id)
      if (prev) clearTimeout(prev)
      const t = setTimeout(() => {
        removeTimersRef.current.delete(id)
        if (cancelled) return
        syncPulses(pulsesRef.current.filter((x) => x.id !== id))
      }, duration + 40)
      removeTimersRef.current.set(id, t)
    }

    const spawnBatch = (count) => {
      if (cancelled || reducedMotionRef.current) return
      if (document.visibilityState === 'hidden') return

      const room = MAX_PULSES - pulsesRef.current.length
      if (room <= 0) return

      const added = []
      const n = Math.min(count, room)
      for (let i = 0; i < n; i++) {
        const id = ++idRef.current
        const pulse = createPulse(rows, cols, cellSize, id)
        if (pulse) added.push(pulse)
      }
      if (!added.length) return

      syncPulses([...pulsesRef.current, ...added])
      for (const pulse of added) armRemove(pulse.id, pulse.duration)
    }

    const scheduleSpawn = () => {
      if (cancelled) return
      const delay = randInt(SPAWN_MIN_MS, SPAWN_MAX_MS)
      spawnTimer = setTimeout(() => {
        // Spawn 1–3 snakes each tick so many overlap in time
        spawnBatch(randInt(1, 3))
        scheduleSpawn()
      }, delay)
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearSpawn()
        clearRemoves()
        syncPulses([])
      } else if (!cancelled && !reducedMotionRef.current) {
        spawnBatch(BURST_ON_START)
        scheduleSpawn()
      }
    }

    if (!reducedMotionRef.current && document.visibilityState !== 'hidden') {
      spawnBatch(BURST_ON_START)
      scheduleSpawn()
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      clearSpawn()
      clearRemoves()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [rows, cols, cellSize])

  return (
    <svg
      className={cn(
        'circuit-traces absolute left-1/2 top-0 z-[4] -translate-x-1/2',
        GRID_MASK,
      )}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <defs>
        <filter
          id="circuit-glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {pulses.map((pulse) => (
        <path
          key={pulse.id}
          className={cn(
            'circuit-pulse',
            pulse.soft ? 'circuit-pulse--soft' : 'circuit-pulse--bright',
          )}
          d={pulse.d}
          pathLength={100}
          strokeWidth={pulse.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#circuit-glow)"
          style={{
            strokeDasharray: `${pulse.snakeUnits} 100`,
            animationDuration: `${pulse.duration}ms`,
          }}
        />
      ))}
    </svg>
  )
}
