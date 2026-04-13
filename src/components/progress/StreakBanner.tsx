import { motion } from 'framer-motion'

interface StreakBannerProps {
  streak: number
  totalXP: number
  level: number
}

export function StreakBanner({ streak, totalXP, level }: StreakBannerProps) {
  return (
    <div className="flex gap-3">
      <motion.div
        className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl px-4 py-3 flex items-center gap-3"
        whileHover={{ borderColor: '#f59e0b40' }}
      >
        <span className="text-2xl">🔥</span>
        <div>
          <div className="text-lg font-black text-stone-100">{streak}</div>
          <div className="text-xs text-stone-500">day streak</div>
        </div>
      </motion.div>
      <motion.div
        className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl px-4 py-3 flex items-center gap-3"
        whileHover={{ borderColor: '#f59e0b40' }}
      >
        <span className="text-2xl">⭐</span>
        <div>
          <div className="text-lg font-black text-amber-400">{totalXP}</div>
          <div className="text-xs text-stone-500">XP · Level {level}</div>
        </div>
      </motion.div>
    </div>
  )
}
