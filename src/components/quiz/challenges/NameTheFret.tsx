import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../../fretboard/Fretboard'
import { QuizPrompt } from '../QuizPrompt'
import { FeedbackOverlay } from '../FeedbackOverlay'
import { Button } from '../../ui/Button'
import { STANDARD_TUNING } from '../../../core/guitar'
import { getNoteAtFret } from '../../../core/fretboard'
import { NATURAL_NOTES } from '../../../types'
import type { FretPosition, ChromaticNote } from '../../../types'

interface Question {
  stringNumber: number
  fret: number
  correctNote: ChromaticNote
  options: string[]
  position: FretPosition
}

function getRandomNaturalFrets(stringNumbers: number[], count: number = 16): Question[] {
  const pool: Question[] = []

  for (const sNum of stringNumbers) {
    const stringDef = STANDARD_TUNING.find((s) => s.stringNumber === sNum)!
    for (let fret = 0; fret <= 12; fret++) {
      const noteAtPos = getNoteAtFret(stringDef, fret)
      if (noteAtPos.isNatural) {
        // Generate 3 wrong options from natural notes
        const wrongs = [...NATURAL_NOTES]
          .filter((n) => n !== noteAtPos.note)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        pool.push({
          stringNumber: sNum,
          fret,
          correctNote: noteAtPos.note,
          options: [...wrongs, noteAtPos.note].sort(() => Math.random() - 0.5),
          position: { stringNumber: sNum as 1|2|3|4|5|6, fret },
        })
      }
    }
  }

  // Shuffle and take required count
  return pool.sort(() => Math.random() - 0.5).slice(0, count)
}

const STRING_LABELS: Record<number, string> = {
  1: 'E1 (thin)', 2: 'B2', 3: 'G3', 4: 'D4', 5: 'A5', 6: 'E6 (thick)',
}

interface NameTheFretProps {
  targetStrings: number[]
  onComplete: (score: number, correct: number, total: number) => void
}

export function NameTheFret({ targetStrings, onComplete }: NameTheFretProps) {
  const [questions] = useState(() => getRandomNaturalFrets(targetStrings))
  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const q = questions[current]

  const handleAnswer = useCallback((option: string) => {
    if (feedback) return
    const isCorrect = option === q.correctNote
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setSelectedOption(option)
    if (isCorrect) setCorrect((c) => c + 1)

    setTimeout(() => {
      setFeedback(null)
      setSelectedOption(null)
      const next = current + 1
      if (next >= questions.length) {
        const finalCorrect = correct + (isCorrect ? 1 : 0)
        onComplete(Math.round((finalCorrect / questions.length) * 100), finalCorrect, questions.length)
      } else {
        setCurrent(next)
      }
    }, 900)
  }, [feedback, q, current, questions, correct, onComplete])

  const highlightPos: FretPosition[] = [q.position]
  const correctPos: FretPosition[] = feedback === 'correct' ? [q.position] : []
  const wrongPos: FretPosition[] = feedback === 'wrong' ? [q.position] : []

  return (
    <div>
      <FeedbackOverlay feedback={feedback} />
      <QuizPrompt
        text={`What note is at fret ${q.fret}?`}
        subtext={`String: ${STRING_LABELS[q.stringNumber]} — Question ${current + 1} of ${questions.length}`}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Fretboard
            mode="quiz"
            interactive={false}
            highlightPositions={highlightPos}
            correctPositions={correctPos}
            wrongPositions={wrongPos}
            highlightedString={q.stringNumber}
            dimUnhighlighted={true}
          />
          <div className="grid grid-cols-4 gap-3 mt-6">
            {q.options.map((option) => {
              let variant: 'ghost' | 'success' | 'danger' = 'ghost'
              if (selectedOption === option) {
                variant = feedback === 'correct' ? 'success' : 'danger'
              } else if (feedback === 'wrong' && option === q.correctNote) {
                variant = 'success'
              }
              return (
                <Button
                  key={option}
                  variant={variant}
                  size="lg"
                  onClick={() => handleAnswer(option)}
                  disabled={!!feedback}
                  fullWidth
                  className="text-xl font-black"
                >
                  {option}
                </Button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
