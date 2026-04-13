import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../../fretboard/Fretboard'
import { QuizPrompt } from '../QuizPrompt'
import { FeedbackOverlay } from '../FeedbackOverlay'
import { STANDARD_TUNING } from '../../../core/guitar'
import type { FretPosition } from '../../../types'

interface Question {
  targetString: number   // 1-6
  label: string          // "E1", "B2", etc.
}

function generateQuestions(): Question[] {
  const shuffled = [...STANDARD_TUNING].sort(() => Math.random() - 0.5)
  // Two rounds
  return [...shuffled, ...[...STANDARD_TUNING].sort(() => Math.random() - 0.5)].map((s) => ({
    targetString: s.stringNumber,
    label: s.label,
  }))
}

interface ClickTheStringProps {
  onComplete: (score: number, correct: number, total: number) => void
}

export function ClickTheString({ onComplete }: ClickTheStringProps) {
  const [questions] = useState(generateQuestions)
  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [highlightString, setHighlightString] = useState<number | undefined>()

  const q = questions[current]

  const handleClick = useCallback((pos: FretPosition) => {
    if (feedback) return

    const isCorrect = pos.stringNumber === q.targetString
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) {
      setCorrect((c) => c + 1)
      setHighlightString(pos.stringNumber)
    } else {
      // Show correct string briefly
      setHighlightString(q.targetString)
    }

    setTimeout(() => {
      setFeedback(null)
      setHighlightString(undefined)
      const next = current + 1
      if (next >= questions.length) {
        const finalScore = Math.round(((correct + (isCorrect ? 1 : 0)) / questions.length) * 100)
        onComplete(finalScore, correct + (isCorrect ? 1 : 0), questions.length)
      } else {
        setCurrent(next)
      }
    }, 900)
  }, [feedback, q, current, questions, correct, onComplete])

  // Build highlight positions: all frets of the target string (for click area) or hint
  const highlightPositions: FretPosition[] = highlightString
    ? Array.from({ length: 13 }, (_, fret) => ({
        stringNumber: highlightString as 1|2|3|4|5|6,
        fret,
      }))
    : []

  return (
    <div>
      <FeedbackOverlay feedback={feedback} />
      <QuizPrompt
        text={`Tap the ${q.label} string`}
        subtext={`Question ${current + 1} of ${questions.length}`}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Fretboard
            mode="quiz"
            interactive={!feedback}
            highlightPositions={feedback === 'correct' ? highlightPositions : []}
            correctPositions={feedback === 'correct' ? highlightPositions : []}
            wrongPositions={feedback === 'wrong' ? highlightPositions : []}
            onFretClick={handleClick}
            dimUnhighlighted={false}
          />
        </motion.div>
      </AnimatePresence>
      <p className="text-center text-stone-500 text-sm mt-3">
        Tap anywhere on the string
      </p>
    </div>
  )
}
