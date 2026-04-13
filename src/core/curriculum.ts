import type { Lesson } from '../types'

export const CURRICULUM: Lesson[] = [
  // ── Phase 1: Open Strings ─────────────────────────────────────────────────
  {
    id: '1.1',
    phase: 1,
    title: 'Meet the Strings',
    description: 'Discover the 6 open strings and their names.',
    challengeType: 'teach',
    xpReward: 20,
  },
  {
    id: '1.2',
    phase: 1,
    title: 'Click the String',
    description: 'Tap the correct string when prompted.',
    challengeType: 'click-the-string',
    xpReward: 30,
    unlockRequirement: '1.1',
  },
  {
    id: '1.3',
    phase: 1,
    title: 'Name That String',
    description: 'A string is highlighted — can you name it?',
    challengeType: 'name-the-string',
    xpReward: 30,
    unlockRequirement: '1.2',
  },
  {
    id: '1.4',
    phase: 1,
    title: 'String Speed Round',
    description: '45 seconds — how many strings can you identify?',
    challengeType: 'speed-round',
    xpReward: 50,
    unlockRequirement: '1.3',
  },

  // ── Phase 2: Natural Notes ────────────────────────────────────────────────
  {
    id: '2.1',
    phase: 2,
    title: 'High E String Notes',
    description: 'Learn the natural notes on the thinnest string (E1).',
    challengeType: 'name-the-fret',
    targetStrings: [1],
    xpReward: 40,
    unlockRequirement: '1.4',
  },
  {
    id: '2.2',
    phase: 2,
    title: 'Find All the Notes',
    description: 'Hunt down every occurrence of a natural note on the fretboard.',
    challengeType: 'click-the-note',
    xpReward: 50,
    unlockRequirement: '2.1',
  },
  {
    id: '2.3',
    phase: 2,
    title: 'B and A Strings',
    description: 'Master the natural notes on strings B2 and A5.',
    challengeType: 'name-the-fret',
    targetStrings: [2, 5],
    xpReward: 40,
    unlockRequirement: '2.2',
  },
  {
    id: '2.4',
    phase: 2,
    title: 'Memory Flash',
    description: 'Notes flash briefly — remember and tap where you saw them.',
    challengeType: 'note-highlight',
    xpReward: 60,
    unlockRequirement: '2.3',
  },
  {
    id: '2.5',
    phase: 2,
    title: 'D and G Strings',
    description: 'Learn the natural notes on strings D4 and G3.',
    challengeType: 'name-the-fret',
    targetStrings: [3, 4],
    xpReward: 40,
    unlockRequirement: '2.4',
  },
  {
    id: '2.6',
    phase: 2,
    title: 'Octave Leap',
    description: 'The same note repeats in a diagonal pattern — discover the shortcut.',
    challengeType: 'click-the-note',
    xpReward: 60,
    unlockRequirement: '2.5',
  },
  {
    id: '2.7',
    phase: 2,
    title: 'Full Board Hunt',
    description: 'Find all 7 natural notes anywhere on the fretboard (85% to pass).',
    challengeType: 'click-the-note',
    xpReward: 80,
    unlockRequirement: '2.6',
  },
  {
    id: '2.8',
    phase: 2,
    title: 'Natural Notes Speed Run',
    description: '60 seconds of rapid-fire questions — both directions.',
    challengeType: 'speed-round',
    xpReward: 100,
    unlockRequirement: '2.7',
  },
]

export function getLessonById(id: string): Lesson | undefined {
  return CURRICULUM.find((l) => l.id === id)
}

export function getLessonsByPhase(phase: number): Lesson[] {
  return CURRICULUM.filter((l) => l.phase === phase)
}
