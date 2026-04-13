import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../../fretboard/Fretboard'
import { QuizPrompt } from '../QuizPrompt'
import { FeedbackOverlay } from '../FeedbackOverlay'
import { Button } from '../../ui/Button'
import { STANDARD_TUNING } from '../../../core/guitar'
import { getNoteAtFret } from '../../../core/fretboard'
import { NATURAL_NOTES } from '../../../types'
import type { FretPosition } from '../../../types'

type QuestionMode = 'name-the-fret' | 'click-the-note' | 'name-the-string'

interface SpeedQuestion {
  mode: QuestionMode
  prompt: string
  subtext: string
  options?: string[]
  correct: string
  targetPositions?: FretPosition[]
  highlightPositions?: FretPosition[]
  targetString?: number
}

function generateStringQuestion(): SpeedQuestion {
  const s = STANDARD_TUNING[Math.floor(Math.random() * STANDARD_TUNING.length)]
  const options = STANDARD_TUNING.map((x) => x.label).sort(() => Math.random() - 0.5).slice(0, 4)
  if (!options.includes(s.label)) options[0] = s.label
  const shuffled = options.sort(() => Math.random() - 0.5)
  const highlightPos: FretPosition[] = Array.from({ length: 13 }, (_, fret) => ({
    stringNumber: s.stringNumber as 1|2|3|4|5|6,
    fret,
  }))
  return {
    mode: 'name-the-string',
    prompt: 'Which string is highlighted?',
    subtext: '',
    options: shuffled,
    correct: s.label,
    highlightPositions: highlightPos,
    targetString: s.stringNumber,
  }
}

function generateFretQuestion(): SpeedQuestion {
  const s = STANDARD_TUNING[Math.floor(Math.random() * STANDARD_TUNING.length)]
  // Pick a random fret with a natural note
  const naturalFrets = Array.from({ length: 13 }, (_, f) => f)
    .filter((f) => getNoteAtFret(s, f).isNatural)
  const fret = naturalFrets[Math.floor(Math.random() * naturalFrets.length)]
  const note = getNoteAtFret(s, fret)
  const wrongs = [...NATURAL_NOTES].filter((n) => n !== note.note).sort(() => Math.random() - 0.5).slice(0, 3)
  const options = [...wrongs, note.note].sort(() => Math.random() - 0.5)
  return {
    mode: 'name-the-fret',
    prompt: `What note is at fret ${fret}?`,
    subtext: `String: ${s.label}`,
    options,
    correct: note.note,
    highlightPositions: [{ stringNumber: s.stringNumber as 1|2|3|4|5|6, fret }],
    targetString: s.stringNumber,
  }
}

interface SpeedRoundProps {
  durationSeconds?: number
  phase?: 1 | 2
  onComplete: (score: number, correct: number, total: number) => void
}

export function SpeedRound({ durationSeconds = 45, phase = 1, onComplete }: SpeedRoundProps) {
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [question, setQuestion] = useState<SpeedQuestion>(() => generateStringQuestion())
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!started) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [started])

  useEffect(() => {
    if (timeLeft === 0 && started) {
      const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
      onComplete(score, correctCount, totalCount)
    }
  }, [timeLeft, started, correctCount, totalCount, onComplete])

  function nextQuestion() {
    const gen = phase === 1
      ? generateStringQuestion
      : Math.random() < 0.5 ? generateStringQuestion : generateFretQuestion
    setQuestion(typeof gen === 'function' ? gen() : gen)
  }

  const handleAnswer = useCallback((answer: string) => {
    if (feedback || timeLeft === 0) return
    const isCorrect = answer === question.correct
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setTotalCount((t) => t + 1)
    if (isCorrect) setCorrectCount((c) => c + 1)
    setTimeout(() => {
      setFeedback(null)
      nextQuestion()
    }, 400)
  }, [feedback, timeLeft, question])

  if (!started) {
    return (
      <div className="text-center">
        <QuizPrompt
          text={`${durationSeconds}-Second Speed Round`}
          subtext="Answer as many questions as you can before time runs out!"
        />
        <div className="mt-8">
          <Button size="lg" onClick={() => setStarted(true)}>
            Start!
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <FeedbackOverlay feedback={feedback} />

      {/* Timer + score bar */}
      <div className="flex justify-between items-center mb-4 px-1">
        <span className={`text-2xl font-black tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
          {timeLeft}s
        </span>
        <span className="text-stone-400 text-sm">
          ✓ {correctCount} / {totalCount}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${question.prompt}-${question.subtext}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          <QuizPrompt text={question.prompt} subtext={question.subtext} />
          <Fretboard
            mode="quiz"
            interactive={false}
            highlightPositions={question.highlightPositions ?? []}
            highlightedString={question.targetString}
            dimUnhighlighted={!!question.targetString}
          />
          {question.options && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {question.options.map((opt) => (
                <Button
                  key={opt}
                  variant="ghost"
                  size="md"
                  onClick={() => handleAnswer(opt)}
                  disabled={!!feedback}
                  fullWidth
                  className="text-lg font-bold"
                >
                  {opt}
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
