import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Lesson, LessonProgress } from '../../types'

interface LessonNodeProps {
  lesson: Lesson
  progress?: LessonProgress
  isUnlocked: boolean
  index: number
}

const CHALLENGE_ICONS: Record<string, string> = {
  'teach': '📖',
  'click-the-string': '👆',
  'name-the-string': '🏷️',
  'click-the-note': '🎯',
  'name-the-fret': '❓',
  'note-highlight': '💡',
  'speed-round': '⚡',
}

export function LessonNode({ lesson, progress, isUnlocked, index }: LessonNodeProps) {
  const navigate = useNavigate()
  const isCompleted = progress?.completed === true
  const stars = progress?.stars ?? 0

  function handleClick() {
    if (!isUnlocked) return
    if (lesson.challengeType === 'teach') {
      navigate(lesson.teachRoute ?? (lesson.phase === 1 ? '/learn/phase1' : '/learn/phase2'))
    } else {
      navigate(`/quiz/${lesson.id}`)
    }
  }

  return (
    <motion.div
      className={`
        flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border
        ${isUnlocked
          ? isCompleted
            ? 'bg-stone-900 border-green-900/50 hover:border-green-700/50'
            : 'bg-stone-900 border-stone-800 hover:border-amber-600/40'
          : 'bg-stone-950 border-stone-900 opacity-50 cursor-not-allowed'
        }
      `}
      onClick={handleClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isUnlocked ? 1 : 0.5, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={isUnlocked ? { x: 4 } : {}}
    >
      {/* Icon */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
        ${isCompleted ? 'bg-green-900/40' : isUnlocked ? 'bg-stone-800' : 'bg-stone-900'}
      `}>
        {isUnlocked ? CHALLENGE_ICONS[lesson.challengeType] ?? '📝' : '🔒'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${isCompleted ? 'text-stone-300' : 'text-stone-200'}`}>
            {lesson.title}
          </span>
          <span className="text-stone-600 text-xs">{lesson.id}</span>
        </div>
        <p className="text-stone-500 text-xs truncate">{lesson.description}</p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {isCompleted && (
          <div className="flex gap-0.5">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`text-sm ${i <= stars ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
            ))}
          </div>
        )}
        <span className="text-xs text-amber-600 font-semibold">+{lesson.xpReward} XP</span>
      </div>
    </motion.div>
  )
}
