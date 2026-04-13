import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StreakBanner } from '../components/progress/StreakBanner'
import { PhaseCard } from '../components/progress/PhaseCard'
import { Fretboard } from '../components/fretboard/Fretboard'
import { useProgressStore } from '../store/progressStore'
import { getLessonsByPhase } from '../core/curriculum'
import type { FretPosition } from '../types'

export function ProgressPage() {
  const navigate = useNavigate()
  const { lessonProgress, currentStreak, totalXP, positionWeights } = useProgressStore()
  const level = useProgressStore((s) => s.level())

  // Build mastery heat map from positionWeights
  // Green = weight < 0.3 (mastered), Yellow = 0.3-0.6, Red = > 0.6 (needs work)
  const masteredPositions: FretPosition[] = []
  const practicePositions: FretPosition[] = []

  Object.entries(positionWeights).forEach(([key, weight]) => {
    const match = key.match(/str(\d+)-fret(\d+)/)
    if (!match) return
    const pos: FretPosition = {
      stringNumber: parseInt(match[1]) as 1|2|3|4|5|6,
      fret: parseInt(match[2]),
    }
    if (weight < 0.3) masteredPositions.push(pos)
    else if (weight < 0.6) practicePositions.push(pos)
  })

  const phase1Lessons = getLessonsByPhase(1)
  const phase2Lessons = getLessonsByPhase(2)

  return (
    <div className="min-h-screen bg-[#0f0a05]">
      <div className="px-4 py-4 border-b border-stone-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-stone-500 hover:text-stone-300 text-sm transition-colors"
          >
            ← Back
          </button>
          <span className="text-stone-300 font-semibold">Your Progress</span>
          <span />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
        <StreakBanner streak={currentStreak} totalXP={totalXP} level={level} />

        {/* Mastery map */}
        {Object.keys(positionWeights).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-5"
          >
            <h3 className="text-stone-300 font-semibold mb-1">Fretboard Mastery Map</h3>
            <p className="text-stone-600 text-xs mb-4">
              Green = mastered · Yellow = practice more · Red = needs work
            </p>
            <Fretboard
              mode="display"
              correctPositions={masteredPositions}
              highlightPositions={practicePositions}
              wrongPositions={Object.entries(positionWeights)
                .filter(([, w]) => w >= 0.6)
                .map(([key]) => {
                  const m = key.match(/str(\d+)-fret(\d+)/)
                  if (!m) return null
                  return { stringNumber: parseInt(m[1]) as 1|2|3|4|5|6, fret: parseInt(m[2]) }
                })
                .filter(Boolean) as FretPosition[]
              }
            />
          </motion.div>
        )}

        {/* Lesson phases */}
        <div className="flex flex-col gap-4">
          <PhaseCard
            phase={1}
            title="Open Strings"
            description="Learn the names of all 6 open strings"
            lessons={phase1Lessons}
            lessonProgress={lessonProgress}
            defaultOpen={true}
          />
          <PhaseCard
            phase={2}
            title="Natural Notes"
            description="Master A B C D E F G across the entire fretboard"
            lessons={phase2Lessons}
            lessonProgress={lessonProgress}
          />
        </div>
      </div>
    </div>
  )
}
