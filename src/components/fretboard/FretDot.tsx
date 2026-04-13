import { motion } from 'framer-motion'
import type { FretPosition } from '../../types'

export type DotState = 'default' | 'highlight' | 'correct' | 'wrong' | 'found' | 'target'

interface FretDotProps {
  position: FretPosition
  state: DotState
  interactive: boolean
  label?: string
  showLabel?: boolean
  onClick?: (pos: FretPosition) => void
  cx: number
  cy: number
  r: number
}

const STATE_STYLES: Record<DotState, { fill: string; stroke: string; strokeWidth: number }> = {
  default:   { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
  highlight: { fill: '#f59e0b', stroke: '#fbbf24', strokeWidth: 1.5 },
  correct:   { fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1.5 },
  wrong:     { fill: '#ef4444', stroke: '#f87171', strokeWidth: 1.5 },
  found:     { fill: '#22c55e', stroke: '#4ade80', strokeWidth: 1.5 },
  target:    { fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 1.5 },
}

export function FretDot({ position, state, interactive, label, showLabel, onClick, cx, cy, r }: FretDotProps) {
  const style = STATE_STYLES[state]
  const isClickable = interactive && state === 'default'
  const isActive = state !== 'default'

  return (
    <motion.g
      onClick={interactive ? () => onClick?.(position) : undefined}
      style={{ cursor: isClickable ? 'pointer' : interactive ? 'pointer' : 'default' }}
      whileHover={interactive ? { scale: 1.15 } : {}}
      whileTap={interactive ? { scale: 0.9 } : {}}
    >
      {/* Hit area (larger invisible circle for easier clicking) */}
      {interactive && (
        <circle cx={cx} cy={cy} r={r + 6} fill="transparent" />
      )}
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        animate={{
          fill: style.fill,
          stroke: style.stroke,
          scale: isActive ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      {showLabel && label && (
        <motion.text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={r * 1.1}
          fontWeight="700"
          fill="#0f172a"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {label}
        </motion.text>
      )}
    </motion.g>
  )
}
