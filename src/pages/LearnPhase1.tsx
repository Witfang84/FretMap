import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../components/fretboard/Fretboard'
import { Button } from '../components/ui/Button'
import { STANDARD_TUNING } from '../core/guitar'
import { useProgressStore } from '../store/progressStore'
import type { FretPosition } from '../types'

const STRING_FACTS: Record<number, string> = {
  1: 'The thinnest string — highest pitch. "E1" or high E.',
  2: 'Second thinnest — "B2". Right below the high E.',
  3: '"G3" — the middle string, open G.',
  4: '"D4" — just below the middle.',
  5: '"A5" — the second thickest, open A.',
  6: 'The thickest string — lowest pitch. "E6" or low E.',
}

export function LearnPhase1() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0 = intro, 1-6 = per-string, 7 = done
  const completeLesson = useProgressStore((s) => s.completeLesson)

  const currentString = step >= 1 && step <= 6 ? STANDARD_TUNING[step - 1] : null

  const highlightPositions: FretPosition[] = currentString
    ? Array.from({ length: 13 }, (_, fret) => ({
        stringNumber: currentString.stringNumber as 1|2|3|4|5|6,
        fret,
      }))
    : []

  return (
    <div className="min-h-screen bg-[#0f0a05] flex flex-col">
      <div className="px-4 py-4 border-b border-stone-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-stone-500 hover:text-stone-300 transition-colors text-sm"
          >
            ← Back
          </button>
          <span className="text-stone-400 text-sm font-medium">Phase 1: Open Strings</span>
          <span className="text-stone-600 text-sm">{Math.min(step, 6)}/6</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="intro"
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="text-4xl font-black text-stone-100 mb-3">
                  Meet the 6 Strings
                </h1>
                <p className="text-stone-400 text-lg mb-6 max-w-md mx-auto">
                  Before you can navigate the fretboard, you need to know your strings.
                  Each string has a name — let's learn them one by one.
                </p>
                <div className="mb-8">
                  <Fretboard mode="teach" showStringLabels={true} />
                </div>
                <Button size="lg" onClick={() => setStep(1)}>
                  Let's go!
                </Button>
              </motion.div>
            )}

            {step >= 1 && step <= 6 && currentString && (
              <motion.div
                key={`string-${step}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="text-7xl font-black text-amber-400 mb-2"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    {currentString.label}
                  </motion.div>
                  <p className="text-stone-300 text-lg">{STRING_FACTS[step]}</p>
                </div>

                <Fretboard
                  mode="teach"
                  showStringLabels={true}
                  highlightPositions={highlightPositions}
                  highlightedString={currentString.stringNumber}
                  dimUnhighlighted={true}
                />

                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                    ← Back
                  </Button>
                  <Button onClick={() => {
                    if (step === 6) completeLesson('1.1', 100, 20)
                    setStep((s) => s + 1)
                  }}>
                    {step < 6 ? `Next: ${STANDARD_TUNING[step]?.label} →` : 'I know all 6! →'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="done"
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-6xl mb-4">🎸</div>
                <h2 className="text-3xl font-black text-stone-100 mb-3">
                  You know the strings!
                </h2>
                <p className="text-stone-400 mb-2">E1 · B2 · G3 · D4 · A5 · E6</p>
                <p className="text-stone-500 text-sm mb-8">Now let's test your memory</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    Review again
                  </Button>
                  <Button size="lg" onClick={() => navigate('/quiz/1.2')}>
                    Start Quiz →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
