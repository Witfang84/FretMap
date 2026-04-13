import { motion } from 'framer-motion'
import { STANDARD_TUNING } from '../../core/guitar'

interface FretboardLegendProps {
  stringYPositions: number[]
  nutX: number
  highlightedString?: number
}

export function FretboardLegend({ stringYPositions, nutX, highlightedString }: FretboardLegendProps) {
  return (
    <g>
      {STANDARD_TUNING.map((string, i) => {
        const isHighlighted = highlightedString === string.stringNumber
        return (
          <motion.text
            key={string.stringNumber}
            x={nutX - 48}
            y={stringYPositions[i]}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="15"
            fontWeight={isHighlighted ? '800' : '600'}
            fill={isHighlighted ? '#f59e0b' : '#9ca3af'}
            animate={{ fill: isHighlighted ? '#f59e0b' : '#9ca3af' }}
            transition={{ duration: 0.3 }}
          >
            {string.label}
          </motion.text>
        )
      })}
    </g>
  )
}
