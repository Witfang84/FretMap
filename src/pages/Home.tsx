import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Fretboard } from '../components/fretboard/Fretboard'
import { Button } from '../components/ui/Button'
import { LessonNode } from '../components/progress/LessonNode'
import { StreakBanner } from '../components/progress/StreakBanner'
import { useProgressStore } from '../store/progressStore'
import { CURRICULUM, getLessonsByPhase } from '../core/curriculum'

export function Home() {
  const navigate = useNavigate()
  const { lessonProgress, currentStreak, totalXP } = useProgressStore()
  const isLessonUnlocked = useProgressStore((s) => s.isLessonUnlocked)
  const level = useProgressStore((s) => s.level())

  // Find the first incomplete unlocked lesson
  const nextLesson = CURRICULUM.find(
    (l) =>
      isLessonUnlocked(l.id, l.unlockRequirement) &&
      !lessonProgress[l.id]?.completed,
  )

  const hasProgress = Object.keys(lessonProgress).length > 0
  const phase1Lessons = getLessonsByPhase(1)
  const phase2Lessons = getLessonsByPhase(2)

  return (
    <div className="min-h-screen bg-[#0f0a05] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-stone-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-xl">🎸</span>
            <span className="text-stone-100 font-black text-xl tracking-tight">FretMap</span>
          </div>
          <button
            onClick={() => navigate('/progress')}
            className="text-stone-500 hover:text-stone-300 text-sm transition-colors"
          >
            Progress →
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Hero */}
        {!hasProgress && (
          <motion.div
            className="text-center py-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-stone-100 mb-3 leading-tight">
              Learn the fretboard.<br />
              <span className="text-amber-400">Note by note.</span>
            </h1>
            <p className="text-stone-400 text-base max-w-sm mx-auto">
              Interactive quizzes that teach you where every note lives on the guitar.
            </p>
          </motion.div>
        )}

        {/* Streak banner if has progress */}
        {hasProgress && (
          <StreakBanner streak={currentStreak} totalXP={totalXP} level={level} />
        )}

        {/* Fretboard preview */}
        <motion.div
          className="bg-stone-900 border border-stone-800 rounded-2xl p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-stone-500 text-xs mb-3 text-center">
            Can you name every note on this fretboard?
          </p>
          <Fretboard mode="display" />
        </motion.div>

        {/* Continue button */}
        {nextLesson && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              fullWidth
              onClick={() => {
                if (nextLesson.challengeType === 'teach') {
                  navigate(nextLesson.teachRoute ?? (nextLesson.phase === 1 ? '/learn/phase1' : '/learn/phase2'))
                } else {
                  navigate(`/quiz/${nextLesson.id}`)
                }
              }}
            >
              {hasProgress ? `Continue: ${nextLesson.title} →` : `Start: ${nextLesson.title} →`}
            </Button>
          </motion.div>
        )}

        {/* All done */}
        {!nextLesson && hasProgress && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-stone-300 font-bold">All lessons complete!</p>
            <p className="text-stone-500 text-sm">Sharps & flats coming in Phase 3...</p>
          </div>
        )}

        {/* Phase 1 lessons */}
        <div>
          <h2 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-3">
            Phase 1 — Open Strings
          </h2>
          <div className="flex flex-col gap-2">
            {phase1Lessons.map((l, i) => (
              <LessonNode
                key={l.id}
                lesson={l}
                progress={lessonProgress[l.id]}
                isUnlocked={isLessonUnlocked(l.id, l.unlockRequirement)}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Phase 2 lessons */}
        <div>
          <h2 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-3">
            Phase 2 — Natural Notes
          </h2>
          <div className="flex flex-col gap-2">
            {phase2Lessons.map((l, i) => (
              <LessonNode
                key={l.id}
                lesson={l}
                progress={lessonProgress[l.id]}
                isUnlocked={isLessonUnlocked(l.id, l.unlockRequirement)}
                index={i}
              />
            ))}
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-stone-700 text-xs">Phase 3 (Sharps & Flats) — coming soon</p>
        </div>
      </div>
    </div>
  )
}
