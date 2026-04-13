import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../../fretboard/Fretboard'
import { QuizPrompt } from '../QuizPrompt'
import { FeedbackOverlay } from '../FeedbackOverlay'
import { Button } from '../../ui/Button'
import { buildFretboard, findAllNaturalPositions, positionsMatch } from '../../../core/fretboard'
import type { FretPosition, NoteAtPosition } from '../../../types'

const FRETBOARD = buildFretboard()
const ALL_NATURAL = findAllNaturalPositions(FRETBOARD)

type Phase = 'show' | 'hide' | 'recall' | 'feedback'

interface Round {
  positions: NoteAtPosition[]
  targetNote: string
}

function pickRound(difficulty: number): Round {
  const count = difficulty <= 2 ? 3 : difficulty <= 4 ? 5 : 8
  const shuffled = [...ALL_NATURAL].sort(() => Math.random() - 0.5)
  const chosen = shuffled.slice(0, count)
  // Pick one note as the target (ask user to find it)
  const target = chosen[Math.floor(Math.random() * chosen.length)]
  return { positions: chosen, targetNote: target.note }
}

interface NoteHighlightProps {
  onComplete: (score: number, correct: number, total: number) => void
}

export function NoteHighlight({ onComplete }: NoteHighlightProps) {
  const [roundNumber, setRoundNumber] = useState(0)
  const [round, setRound] = useState(() => pickRound(1))
  const [phase, setPhase] = useState<Phase>('show')
  const [found, setFound] = useState<FretPosition[]>([])
  const [wrongTaps, setWrongTaps] = useState<FretPosition[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const TOTAL_ROUNDS = 6

  // Auto-hide after 2.5 seconds
  useEffect(() => {
    if (phase !== 'show') return
    const t = setTimeout(() => setPhase('recall'), 2500)
    return () => clearTimeout(t)
  }, [phase, round])

  const handleClick = useCallback((pos: FretPosition) => {
    if (phase !== 'recall') return

    const correctTarget = round.positions.find(
      (p) => positionsMatch(p, pos) && p.note === round.targetNote,
    )

    if (correctTarget) {
      setFound((f) => [...f, pos])
      setFeedback('correct')
      setCorrectCount((c) => c + 1)
      setTimeout(() => {
        setFeedback(null)
        setPhase('feedback')
      }, 600)
    } else {
      setWrongTaps((w) => [...w, pos])
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        setWrongTaps([])
      }, 600)
    }
  }, [phase, round])

  function handleNext() {
    const next = roundNumber + 1
    if (next >= TOTAL_ROUNDS) {
      onComplete(Math.round((correctCount / TOTAL_ROUNDS) * 100), correctCount, TOTAL_ROUNDS)
      return
    }
    setRoundNumber(next)
    setRound(pickRound(next + 1))
    setPhase('show')
    setFound([])
    setWrongTaps([])
    setFeedback(null)
  }

  const showPositions: FretPosition[] = phase === 'show' ? round.positions : []
  const targetPositions = round.positions.filter((p) => p.note === round.targetNote)

  return (
    <div>
      <FeedbackOverlay feedback={feedback} />
      <AnimatePresence mode="wait">
        {phase === 'show' && (
          <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizPrompt
              text="Memorize these positions!"
              subtext={`Watch for the note "${round.targetNote}" — they'll disappear in 2.5 seconds`}
            />
          </motion.div>
        )}
        {phase === 'recall' && (
          <motion.div key="recall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizPrompt
              text={`Where was the note "${round.targetNote}"?`}
              subtext="Tap where you saw it"
            />
          </motion.div>
        )}
        {phase === 'feedback' && (
          <motion.div key="fb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizPrompt
              text={found.length > 0 ? "Correct!" : "Not quite..."}
              subtext={`Round ${roundNumber + 1} of ${TOTAL_ROUNDS}`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Fretboard
        mode={phase === 'show' ? 'teach' : 'quiz'}
        interactive={phase === 'recall'}
        highlightPositions={showPositions}
        correctPositions={phase === 'feedback' ? targetPositions : found}
        wrongPositions={wrongTaps}
        onFretClick={handleClick}
      />

      <div className="mt-4 flex justify-between items-center px-1">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < roundNumber ? 'bg-green-500' :
                i === roundNumber ? 'bg-amber-400' :
                'bg-stone-700'
              }`}
            />
          ))}
        </div>
        <span className="text-stone-500 text-xs">Round {roundNumber + 1}/{TOTAL_ROUNDS}</span>
      </div>

      {phase === 'feedback' && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button onClick={handleNext} variant="primary" size="lg">
            {roundNumber < TOTAL_ROUNDS - 1 ? 'Next Round' : 'See Results'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
