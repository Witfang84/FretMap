import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../components/fretboard/Fretboard'
import { Button } from '../components/ui/Button'
import { buildFretboard, findAllPositionsOfNote } from '../core/fretboard'
import type { FretPosition, NaturalNote } from '../types'
import { NATURAL_NOTES } from '../types'

const FRETBOARD = buildFretboard()

const NOTE_FACTS: Record<NaturalNote, string> = {
  E: 'E appears on fret 0 and 12 of strings E1 and E6. It\'s the most common open note!',
  F: 'F is right next to E — always one fret higher. No gap between E and F.',
  G: 'G sits at fret 3 on the high E string (E1). Easy anchor point.',
  A: 'A is fret 5 on E1, and the open A5 string. Great reference note.',
  B: 'B is fret 7 on E1, and the open B2 string.',
  C: 'C is fret 8 on E1. Remember: no gap between B and C (like E and F).',
  D: 'D is fret 10 on E1, and the open D4 string.',
}

export function LearnPhase2() {
  const navigate = useNavigate()
  const [noteIndex, setNoteIndex] = useState(0)

  const currentNote = NATURAL_NOTES[noteIndex]
  const positions: FretPosition[] = findAllPositionsOfNote(FRETBOARD, currentNote)

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
          <span className="text-stone-400 text-sm font-medium">Phase 2: Natural Notes</span>
          <span className="text-stone-600 text-sm">{noteIndex + 1}/{NATURAL_NOTES.length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNote}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="text-8xl font-black text-amber-400 mb-3"
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                >
                  {currentNote}
                </motion.div>
                <p className="text-stone-300 text-base max-w-md mx-auto">
                  {NOTE_FACTS[currentNote]}
                </p>
                <p className="text-stone-500 text-sm mt-2">
                  {positions.length} positions on the fretboard
                </p>
              </div>

              {/* Note selector */}
              <div className="flex justify-center gap-2 mb-6">
                {NATURAL_NOTES.map((note, i) => (
                  <button
                    key={note}
                    onClick={() => setNoteIndex(i)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-all duration-200 ${
                      i === noteIndex
                        ? 'bg-amber-500 text-stone-900 scale-110'
                        : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>

              <Fretboard
                mode="teach"
                showStringLabels={true}
                highlightPositions={positions}
              />

              <div className="flex justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setNoteIndex((i) => Math.max(0, i - 1))}
                  disabled={noteIndex === 0}
                >
                  ← Prev
                </Button>
                {noteIndex < NATURAL_NOTES.length - 1 ? (
                  <Button onClick={() => setNoteIndex((i) => i + 1)}>
                    Next: {NATURAL_NOTES[noteIndex + 1]} →
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/quiz/2.1')}>
                    Start Quizzes →
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
