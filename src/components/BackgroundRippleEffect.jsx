import { useEffect, useMemo, useState } from 'react'
import { cn } from '../lib/utils'

const CELL_SIZE = 56

/**
 * Aceternity-style cell grid.
 * Ripples from any page click (maps coordinates → cell) so UI on top still triggers it.
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

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full overflow-hidden',
        /* Light — base #e8f0fd (stronger blue so tiles read clearly) */
        '[--cell-border-color:rgba(37,99,235,0.42)]',
        '[--cell-fill-color:rgba(96,165,250,0.55)]',
        '[--cell-shadow-color:rgba(37,99,235,0.28)]',
        /* Dark — base #0d1535 */
        'dark:[--cell-border-color:rgba(148,163,184,0.28)]',
        'dark:[--cell-fill-color:rgba(26,42,94,0.65)]',
        'dark:[--cell-shadow-color:rgba(59,130,246,0.28)]',
      )}
      aria-hidden="true"
    >
      <div className="relative h-full w-full overflow-hidden">
        <DivGrid
          key={`base-${rippleKey}`}
          className="opacity-95 dark:opacity-80 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]"
          rows={grid.rows}
          cols={grid.cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
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
