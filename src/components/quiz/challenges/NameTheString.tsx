import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../../fretboard/Fretboard'
import { QuizPrompt } from '../QuizPrompt'
import { Button } from '../../ui/Button'
import { STANDARD_TUNING } from '../../../core/guitar'
import type { FretPosition } from '../../../types'

interface Question {
  targetString: number
  label: string
  options: string[]
}

function generateOptions(correct: string): string[] {
  const all = STANDARD_TUNING.map((s) => s.label)
  const others = all.filter((l) => l !== correct).sort(() => Math.random() - 0.5).slice(0, 3)
  return [...others, correct].sort(() => Math.random() - 0.5)
}

function generateQuestions(): Question[] {
  const shuffled = [...STANDARD_TUNING].sort(() => Math.random() - 0.5)
  return [...shuffled, ...[...STANDARD_TUNING].sort(() => Math.random() - 0.5)].map((s) => ({
    targetString: s.stringNumber,
    label: s.label,
    options: generateOptions(s.label),
  }))
}

interface NameTheStringProps {
  onComplete: (score: number, correct: number, total: number) => void
}

export function NameTheString({ onComplete }: NameTheStringProps) {
  const [questions] = useState(generateQuestions)
  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const q = questions[current]

  // Highlight the target string on the fretboard
  const targetPositions: FretPosition[] = Array.from({ length: 13 }, (_, fret) => ({
    stringNumber: q.targetString as 1|2|3|4|5|6,
    fret,
  }))

  const handleAnswer = useCallback((option: string) => {
    if (feedback) return
    const isCorrect = option === q.label
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

  return (
    <div>
      <QuizPrompt
        text="Which string is highlighted?"
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
            interactive={false}
            highlightPositions={targetPositions}
            dimUnhighlighted={true}
            highlightedString={q.targetString}
          />
          <div className="grid grid-cols-2 gap-3 mt-6">
            {q.options.map((option) => {
              let variant: 'ghost' | 'success' | 'danger' = 'ghost'
              if (selectedOption === option) {
                variant = feedback === 'correct' ? 'success' : 'danger'
              } else if (feedback === 'wrong' && option === q.label) {
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
