import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LessonNode } from './LessonNode'
import { ProgressBar } from '../ui/ProgressBar'
import type { Lesson, LessonProgress } from '../../types'
import { useProgressStore } from '../../store/progressStore'

interface PhaseCardProps {
  phase: number
  title: string
  description: string
  lessons: Lesson[]
  lessonProgress: Record<string, LessonProgress>
  defaultOpen?: boolean
}

export function PhaseCard({ phase, title, description, lessons, lessonProgress, defaultOpen = false }: PhaseCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const isLessonUnlocked = useProgressStore((s) => s.isLessonUnlocked)

  const completedCount = lessons.filter((l) => lessonProgress[l.id]?.completed).length

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
      <button
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone-800/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Phase {phase}
            </span>
            <h3 className="font-bold text-stone-100">{title}</h3>
          </div>
          <p className="text-stone-500 text-xs mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span className="text-stone-500 text-xs">{completedCount}/{lessons.length}</span>
          <motion.span
            className="text-stone-400 text-lg"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ↓
          </motion.span>
        </div>
      </button>

      <div className="px-5 pb-3">
        <ProgressBar value={completedCount} max={lessons.length} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 flex flex-col gap-2">
              {lessons.map((lesson, i) => (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  progress={lessonProgress[lesson.id]}
                  isUnlocked={isLessonUnlocked(lesson.id, lesson.unlockRequirement)}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
