import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number       // 0-100
  max?: number
  color?: string
  height?: number
  showLabel?: boolean
  label?: string
}

export function ProgressBar({
  value,
  max = 100,
  color = 'bg-amber-500',
  height = 6,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-stone-400 mb-1">
          <span>{label ?? 'Progress'}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="w-full bg-stone-800 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
