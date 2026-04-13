import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../../fretboard/Fretboard'
import { QuizPrompt } from '../QuizPrompt'
import { FeedbackOverlay } from '../FeedbackOverlay'
import { Button } from '../../ui/Button'
import { buildFretboard, findAllPositionsOfNote, positionsMatch } from '../../../core/fretboard'
import type { FretPosition, NaturalNote } from '../../../types'

const FRETBOARD = buildFretboard()

// Notes to cycle through for each lesson variant
const NOTE_SEQUENCES: Record<string, NaturalNote[]> = {
  basic: ['G', 'A', 'D', 'E', 'F', 'B', 'C'],
  octave: ['A', 'D', 'E'],   // for octave recognition lesson
  full: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
}

interface ClickTheNoteProps {
  variant?: 'basic' | 'octave' | 'full'
  onComplete: (score: number, correct: number, total: number) => void
}

export function ClickTheNote({ variant = 'basic', onComplete }: ClickTheNoteProps) {
  const notes = NOTE_SEQUENCES[variant]
  const [noteIndex, setNoteIndex] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalMistakes, setTotalMistakes] = useState(0)
  const [foundPositions, setFoundPositions] = useState<FretPosition[]>([])
  const [wrongPositions, setWrongPositions] = useState<FretPosition[]>([])
  const [roundDone, setRoundDone] = useState(false)
  const [globalFeedback, setGlobalFeedback] = useState<'correct' | 'wrong' | null>(null)

  const currentNote = notes[noteIndex]
  const targetPositions = useMemo(
    () => findAllPositionsOfNote(FRETBOARD, currentNote),
    [currentNote],
  )

  const handleClick = useCallback((pos: FretPosition) => {
    if (roundDone) return

    const isTarget = targetPositions.some((t) => positionsMatch(t, pos))
    const alreadyFound = foundPositions.some((f) => positionsMatch(f, pos))
    if (alreadyFound) return

    if (isTarget) {
      const newFound = [...foundPositions, pos]
      setFoundPositions(newFound)
      setTotalCorrect((c) => c + 1)
      setGlobalFeedback('correct')
      setTimeout(() => setGlobalFeedback(null), 500)

      if (newFound.length === targetPositions.length) {
        setRoundDone(true)
      }
    } else {
      setWrongPositions((w) => [...w, pos])
      setTotalMistakes((m) => m + 1)
      setGlobalFeedback('wrong')
      setTimeout(() => {
        setGlobalFeedback(null)
        setWrongPositions((w) => w.filter((p) => !positionsMatch(p, pos)))
      }, 600)
    }
  }, [roundDone, targetPositions, foundPositions])

  function handleNextNote() {
    const next = noteIndex + 1
    if (next >= notes.length) {
      const total = notes.reduce(
        (acc, note) => acc + findAllPositionsOfNote(FRETBOARD, note).length,
        0,
      )
      const score = Math.max(0, Math.round(((totalCorrect) / (totalCorrect + totalMistakes)) * 100))
      onComplete(score, totalCorrect, total)
    } else {
      setNoteIndex(next)
      setFoundPositions([])
      setWrongPositions([])
      setRoundDone(false)
    }
  }

  const remaining = targetPositions.length - foundPositions.length

  return (
    <div>
      <FeedbackOverlay feedback={globalFeedback} />
      <QuizPrompt
        text={`Find all "${currentNote}" notes`}
        subtext={`Tap every ${currentNote} on the fretboard — ${foundPositions.length}/${targetPositions.length} found`}
      />

      {/* Progress counter */}
      <div className="flex justify-center mb-4">
        <div className="flex gap-2">
          {targetPositions.map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                i < foundPositions.length ? 'bg-green-500' : 'bg-stone-700'
              }`}
              animate={i < foundPositions.length ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      <Fretboard
        mode="quiz"
        interactive={!roundDone}
        foundPositions={foundPositions}
        wrongPositions={wrongPositions}
        onFretClick={handleClick}
      />

      <AnimatePresence>
        {roundDone && (
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-green-400 font-bold text-lg mb-1">All {currentNote}s found!</p>
            {totalMistakes > 0 && (
              <p className="text-stone-500 text-sm mb-4">{totalMistakes} wrong tap{totalMistakes !== 1 ? 's' : ''} this round</p>
            )}
            {noteIndex < notes.length - 1 ? (
              <Button onClick={handleNextNote} variant="primary" size="lg">
                Next note: {notes[noteIndex + 1]}
              </Button>
            ) : (
              <Button onClick={handleNextNote} variant="primary" size="lg">
                See Results
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!roundDone && (
        <p className="text-center text-stone-500 text-sm mt-3">
          {remaining} more to find
        </p>
      )}
    </div>
  )
}
