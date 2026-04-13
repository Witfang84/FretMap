import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Fretboard } from '../components/fretboard/Fretboard'
import { Button } from '../components/ui/Button'
import { useProgressStore } from '../store/progressStore'
import type { FretPosition } from '../types'

// ─── Pre-computed highlight sets ───────────────────────────────────────────

// All natural notes on string 1 (E4): E=0,F=1,G=3,A=5,B=7,C=8,D=10,E=12
const STRING1_NATURAL: FretPosition[] = [0, 1, 3, 5, 7, 8, 10, 12].map((fret) => ({
  stringNumber: 1,
  fret,
}))

// E and F positions on every string (E→F = half tone, 1 fret apart)
// E positions: str1=0, str2=5, str3=9, str4=2, str5=7, str6=0
// F positions: str1=1, str2=6, str3=10, str4=3, str5=8, str6=1
const ALL_E: FretPosition[] = [
  { stringNumber: 1, fret: 0 }, { stringNumber: 2, fret: 5 },
  { stringNumber: 3, fret: 9 }, { stringNumber: 4, fret: 2 },
  { stringNumber: 5, fret: 7 }, { stringNumber: 6, fret: 0 },
]
const ALL_F: FretPosition[] = [
  { stringNumber: 1, fret: 1 }, { stringNumber: 2, fret: 6 },
  { stringNumber: 3, fret: 10 }, { stringNumber: 4, fret: 3 },
  { stringNumber: 5, fret: 8 }, { stringNumber: 6, fret: 1 },
]
// B and C positions (B→C = half tone)
// B positions: str1=7, str2=0, str3=4, str4=9, str5=2, str6=7
// C positions: str1=8, str2=1, str3=5, str4=10, str5=3, str6=8
const ALL_B: FretPosition[] = [
  { stringNumber: 1, fret: 7 }, { stringNumber: 2, fret: 0 },
  { stringNumber: 3, fret: 4 }, { stringNumber: 4, fret: 9 },
  { stringNumber: 5, fret: 2 }, { stringNumber: 6, fret: 7 },
]
const ALL_C: FretPosition[] = [
  { stringNumber: 1, fret: 8 }, { stringNumber: 2, fret: 1 },
  { stringNumber: 3, fret: 5 }, { stringNumber: 4, fret: 10 },
  { stringNumber: 5, fret: 3 }, { stringNumber: 6, fret: 8 },
]

// Strings 1 & 6: all frets 0–12
const STRINGS_1_AND_6: FretPosition[] = Array.from({ length: 13 }, (_, f) => [
  { stringNumber: 1 as const, fret: f },
  { stringNumber: 6 as const, fret: f },
]).flat()

// Fret 12 positions
const FRET_12: FretPosition[] = [1, 2, 3, 4, 5, 6].map((s) => ({
  stringNumber: s as 1 | 2 | 3 | 4 | 5 | 6,
  fret: 12,
}))
// Open string positions
const OPEN_STRINGS: FretPosition[] = [1, 2, 3, 4, 5, 6].map((s) => ({
  stringNumber: s as 1 | 2 | 3 | 4 | 5 | 6,
  fret: 0,
}))

// Fret 5 rule: fret 5 on str6/5/4/2 and fret 4 on str3 match the next open string
const FRET5_RULE: FretPosition[] = [
  { stringNumber: 6, fret: 5 }, { stringNumber: 5, fret: 0 },  // A
  { stringNumber: 5, fret: 5 }, { stringNumber: 4, fret: 0 },  // D
  { stringNumber: 4, fret: 5 }, { stringNumber: 3, fret: 0 },  // G
  { stringNumber: 2, fret: 5 }, { stringNumber: 1, fret: 0 },  // E
]
// The exception pair: string 3 fret 4 = string 2 open (B)
const FRET5_EXCEPTION: FretPosition[] = [
  { stringNumber: 3, fret: 4 }, { stringNumber: 2, fret: 0 },
]

// Fret 7 rule: fret 7 on str N = fret 2 on str N-1
const FRET7_RULE: FretPosition[] = [
  { stringNumber: 6, fret: 7 }, { stringNumber: 5, fret: 2 },  // B
  { stringNumber: 5, fret: 7 }, { stringNumber: 4, fret: 2 },  // E
  { stringNumber: 4, fret: 7 }, { stringNumber: 3, fret: 2 },  // A
  { stringNumber: 2, fret: 7 }, { stringNumber: 1, fret: 2 },  // F#
]
// Exception: str3 fret7 ≠ str2 fret2
const FRET7_EXCEPTION: FretPosition[] = [
  { stringNumber: 3, fret: 7 },
]

// Triangle (octave) rule examples
// E triangles: (str6,0)→(str4,2)→(str2,5)  [crosses G→B so +3 on 2nd jump]
const TRIANGLE_E: FretPosition[] = [
  { stringNumber: 6, fret: 0 }, { stringNumber: 4, fret: 2 }, { stringNumber: 2, fret: 5 },
]
// A triangle: (str5,0)→(str3,2)→(str1,5)
const TRIANGLE_A: FretPosition[] = [
  { stringNumber: 5, fret: 0 }, { stringNumber: 3, fret: 2 }, { stringNumber: 1, fret: 5 },
]

// ─── Step definitions ──────────────────────────────────────────────────────

interface Step {
  title: string
  body: string
  extra?: string
  correctPositions?: FretPosition[]
  highlightPositions?: FretPosition[]
  wrongPositions?: FretPosition[]
  foundPositions?: FretPosition[]
  highlightedString?: number
  dimUnhighlighted?: boolean
  showStringLabels?: boolean
}

const STEPS: Step[] = [
  // 0 — intro
  {
    title: 'Fretboard Navigation',
    body: 'Before diving deeper into natural notes, learn a handful of shortcuts. Each one lets you find any note on any string — instantly.',
    extra: 'Work through this guide step by step, then tackle the quizzes.',
    showStringLabels: true,
  },
  // 1 — natural notes in order
  {
    title: 'The 7 Natural Notes',
    body: 'Guitar uses 7 natural notes that repeat in a cycle: C · D · E · F · G · A · B · C · D · …\nStarting from C makes the pattern easy to memorise — it matches the piano white keys.',
    extra: 'Below: all natural notes on string E1 (the thinnest). Notice the spacing isn\'t always 2 frets.',
    highlightPositions: STRING1_NATURAL,
    highlightedString: 1,
    dimUnhighlighted: true,
  },
  // 2 — whole & half tones
  {
    title: 'Whole Tones & Half Tones',
    body: 'Most adjacent natural notes are 2 frets apart (whole tone). But two pairs are only 1 fret apart (half tone):\n\n  E → F  (1 fret)   ·   B → C  (1 fret)\n\nEvery other pair is 2 frets. No exceptions.',
    extra: 'On string E1: E=fret 0, F=fret 1 (adjacent!), then G=fret 3, A=5, B=7, C=8 (adjacent!), D=10, E=12.',
    correctPositions: [{ stringNumber: 1, fret: 0 }, { stringNumber: 1, fret: 1 }],     // E-F pair
    highlightPositions: [{ stringNumber: 1, fret: 7 }, { stringNumber: 1, fret: 8 }],  // B-C pair
    wrongPositions: [],
    highlightedString: 1,
    dimUnhighlighted: true,
  },
  // 3 — E-F and B-C everywhere
  {
    title: 'E–F and B–C on Every String',
    body: 'Because E→F and B→C are half tones, you\'ll find these adjacent pairs on every single string.\n\nGreen = E  ·  Orange = F  ·  Yellow = B  ·  Red = C',
    extra: 'Spotting these pairs instantly on any string is a huge shortcut for locating notes.',
    correctPositions: ALL_E,
    highlightPositions: ALL_B,
    wrongPositions: ALL_C,
    foundPositions: ALL_F,
  },
  // 4 — strings 1 & 6
  {
    title: 'String 1 and String 6 Are Both E',
    body: 'The thinnest string (E1) and the thickest string (E6) start on the same note — E. They\'re 2 octaves apart, but the note names at every fret are identical.\n\nLearn one string, and you already know the other!',
    highlightPositions: STRINGS_1_AND_6,
    showStringLabels: true,
  },
  // 5 — fret 12 repeats
  {
    title: 'Fret 12 = Open String',
    body: 'At fret 12, every string plays the exact same note as its open string — one octave higher. The entire fretboard repeats beyond fret 12.\n\nYou already know all 12 frets if you know your open strings!',
    extra: 'Green = fret 12  ·  Yellow = open strings (same note names)',
    correctPositions: FRET_12,
    highlightPositions: OPEN_STRINGS,
    showStringLabels: true,
  },
  // 6 — fret 5 rule
  {
    title: 'The Fret 5 Rule',
    body: 'Playing fret 5 on any string gives you the same note as the next thinner string played open. This is how guitarists tune by ear.\n\n⚠ Exception: on string G (string 3), use fret 4 — not 5 — to match string B open.',
    extra: 'Green = matching pairs  ·  Orange = the G-string exception (fret 4)',
    correctPositions: FRET5_RULE,
    highlightPositions: FRET5_EXCEPTION,
    showStringLabels: true,
  },
  // 7 — fret 7 rule
  {
    title: 'The Fret 7 Rule',
    body: 'Fret 7 on a string gives the same note as fret 2 on the next thinner string. This creates a cross-string shortcut for locating notes.\n\n⚠ Same exception: the G→B string pair breaks this rule.',
    extra: 'Green = matching pairs  ·  Red = the G-string exception (not equal)',
    correctPositions: FRET7_RULE,
    wrongPositions: FRET7_EXCEPTION,
    showStringLabels: true,
  },
  // 8 — triangle rule
  {
    title: 'The Triangle Rule (Octave Shortcut)',
    body: 'To find the same note one octave higher: go 2 strings thinner AND 2 frets higher. If the path crosses the B string (string 2), add 1 extra fret (+3 instead of +2).\n\nThis diagonal always forms a triangle you can visualise anywhere on the neck.',
    extra: 'Green = E triangles (str6→str4→str2)  ·  Yellow = A triangle (str5→str3→str1)',
    correctPositions: TRIANGLE_E,
    highlightPositions: TRIANGLE_A,
    showStringLabels: true,
  },
  // 9 — done
  {
    title: 'You\'re Ready!',
    body: 'Here\'s your cheat sheet:\n\n• 7 natural notes: C D E F G A B\n• Half tones: E→F and B→C (1 fret)\n• Strings 1 & 6 are both E\n• Fret 12 = open note (octave up)\n• Fret 5 = next open string (fret 4 on G)\n• Fret 7 = fret 2 one string thinner\n• Octave: +2 strings, +2 frets (+3 if crossing B)',
    extra: 'These patterns will speed up every quiz that follows.',
    showStringLabels: true,
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

export function LearnTips() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const completeLesson = useProgressStore((s) => s.completeLesson)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  function handleNext() {
    if (isLast) {
      completeLesson('2.0', 100, 20)
      navigate('/quiz/2.1')
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0a05] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-stone-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-stone-500 hover:text-stone-300 transition-colors text-sm"
          >
            ← Back
          </button>
          <span className="text-stone-400 text-sm font-medium">Phase 2: Natural Notes</span>
          <span className="text-stone-600 text-sm">{step}/{STEPS.length - 1}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-stone-900">
        <motion.div
          className="h-full bg-amber-500"
          animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-6">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {/* Title */}
              <motion.h2
                className="text-2xl md:text-3xl font-black text-stone-100 mb-4"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                {current.title}
              </motion.h2>

              {/* Body text */}
              <motion.div
                className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {current.body.split('\n').map((line, i) => (
                  <p key={i} className={`text-stone-300 text-sm leading-relaxed ${i > 0 && line === '' ? 'mt-2' : i > 0 ? 'mt-1' : ''}`}>
                    {line || '\u00A0'}
                  </p>
                ))}
                {current.extra && (
                  <p className="text-stone-500 text-xs mt-3 pt-3 border-t border-stone-800">
                    {current.extra}
                  </p>
                )}
              </motion.div>

              {/* Fretboard visualization */}
              {step < STEPS.length - 1 && (
                <motion.div
                  className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Fretboard
                    mode={current.showStringLabels ? 'teach' : 'display'}
                    showStringLabels={current.showStringLabels}
                    highlightPositions={current.highlightPositions ?? []}
                    correctPositions={current.correctPositions ?? []}
                    wrongPositions={current.wrongPositions ?? []}
                    foundPositions={current.foundPositions ?? []}
                    highlightedString={current.highlightedString}
                    dimUnhighlighted={current.dimUnhighlighted ?? false}
                  />
                </motion.div>
              )}

              {/* Done step: show summary fretboard */}
              {isLast && (
                <motion.div
                  className="text-center mb-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 14 }}
                >
                  <div className="text-5xl mb-3">🎸</div>
                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 text-left">
                    <Fretboard mode="teach" showStringLabels={true} />
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex justify-between gap-3">
                {!isFirst ? (
                  <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                    ← Back
                  </Button>
                ) : (
                  <span />
                )}
                <Button size="lg" onClick={handleNext}>
                  {isLast ? 'Start Phase 2 Quizzes →' : step === 0 ? 'Let\'s go! →' : `Next (${step + 1}/${STEPS.length - 1}) →`}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
