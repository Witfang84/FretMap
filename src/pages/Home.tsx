import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Fretboard } from '../components/fretboard/Fretboard'
import { Button } from '../components/ui/Button'
import { StreakBanner } from '../components/progress/StreakBanner'
import { PhaseCard } from '../components/progress/PhaseCard'
import { useProgressStore } from '../store/progressStore'
import { CURRICULUM, getLessonsByPhase } from '../core/curriculum'
import type { FretPosition } from '../types'

export function Home() {
  const navigate = useNavigate()
  const { lessonProgress, currentStreak, totalXP, positionWeights, adminMode } = useProgressStore()
  const isLessonUnlocked = useProgressStore((s) => s.isLessonUnlocked)
  const toggleAdminMode = useProgressStore((s) => s.toggleAdminMode)
  const level = useProgressStore((s) => s.level())

  // First incomplete unlocked lesson → big CTA button
  const nextLesson = CURRICULUM.find(
    (l) =>
      isLessonUnlocked(l.id, l.unlockRequirement) &&
      !lessonProgress[l.id]?.completed,
  )

  const hasProgress = Object.keys(lessonProgress).length > 0
  const hasMasteryData = Object.keys(positionWeights).length > 0

  // Build mastery heat map buckets from spaced-repetition weights
  const masteredPositions: FretPosition[] = []
  const practicePositions: FretPosition[] = []
  const needsWorkPositions: FretPosition[] = []

  Object.entries(positionWeights).forEach(([key, weight]) => {
    const m = key.match(/str(\d+)-fret(\d+)/)
    if (!m) return
    const pos: FretPosition = {
      stringNumber: parseInt(m[1]) as 1 | 2 | 3 | 4 | 5 | 6,
      fret: parseInt(m[2]),
    }
    if (weight < 0.3) masteredPositions.push(pos)
    else if (weight < 0.6) practicePositions.push(pos)
    else needsWorkPositions.push(pos)
  })

  const phase1Lessons = getLessonsByPhase(1)
  const phase2Lessons = getLessonsByPhase(2)

  function handleContinue() {
    if (!nextLesson) return
    if (nextLesson.challengeType === 'teach') {
      navigate(nextLesson.teachRoute ?? (nextLesson.phase === 1 ? '/learn/phase1' : '/learn/phase2'))
    } else {
      navigate(`/quiz/${nextLesson.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0a05] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-stone-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-xl">🎸</span>
            <span className="text-stone-100 font-black text-xl tracking-tight">FretMap</span>
          </div>
          <div className="flex items-center gap-3">
            {hasProgress && (
              <span className="text-stone-600 text-xs font-semibold">
                Level {level}
              </span>
            )}
            <button
              onClick={toggleAdminMode}
              className={`text-xs font-bold px-2 py-0.5 rounded border transition-colors ${
                adminMode
                  ? 'bg-amber-500 border-amber-500 text-black'
                  : 'border-stone-700 text-stone-600 hover:border-stone-500 hover:text-stone-400'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* ── New-user hero ─────────────────────────────────── */}
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

        {/* ── Streak / XP banner ────────────────────────────── */}
        {hasProgress && (
          <StreakBanner streak={currentStreak} totalXP={totalXP} level={level} />
        )}

        {/* ── Fretboard panel ───────────────────────────────── */}
        <motion.div
          className="bg-stone-900 border border-stone-800 rounded-2xl p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {hasMasteryData ? (
            <>
              <h3 className="text-stone-300 font-semibold mb-1">Fretboard Mastery Map</h3>
              <p className="text-stone-600 text-xs mb-4">
                Green = mastered · Yellow = practice more · Red = needs work
              </p>
              <Fretboard
                mode="display"
                correctPositions={masteredPositions}
                highlightPositions={practicePositions}
                wrongPositions={needsWorkPositions}
              />
            </>
          ) : (
            <>
              <p className="text-stone-500 text-sm mb-3 text-center">
                Can you name every note on this fretboard?
              </p>
              <Fretboard mode="display" />
            </>
          )}
        </motion.div>

        {/* ── Continue / Start CTA ──────────────────────────── */}
        {nextLesson && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button size="lg" fullWidth onClick={handleContinue}>
              {hasProgress ? `Continue: ${nextLesson.title} →` : `Start: ${nextLesson.title} →`}
            </Button>
          </motion.div>
        )}

        {/* ── All done ──────────────────────────────────────── */}
        {!nextLesson && hasProgress && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-stone-300 font-bold">All lessons complete!</p>
            <p className="text-stone-500 text-sm">Sharps & flats coming in Phase 3…</p>
          </div>
        )}

        {/* ── Phase dashboards (collapsible) ────────────────── */}
        <div className="flex flex-col gap-4">
          <PhaseCard
            phase={1}
            title="Open Strings"
            description="Learn the names of all 6 open strings"
            lessons={phase1Lessons}
            lessonProgress={lessonProgress}
            defaultOpen={!nextLesson || nextLesson.phase === 1}
          />
          <PhaseCard
            phase={2}
            title="Natural Notes"
            description="Master A B C D E F G across the entire fretboard"
            lessons={phase2Lessons}
            lessonProgress={lessonProgress}
            defaultOpen={nextLesson?.phase === 2}
          />
        </div>

        <div className="text-center py-4">
          <p className="text-stone-700 text-xs">Phase 3 (Sharps & Flats) — coming soon</p>
        </div>

      </div>
    </div>
  )
}
