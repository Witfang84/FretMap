export const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export type ChromaticNote = (typeof CHROMATIC)[number]

export const NATURAL_NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
export type NaturalNote = (typeof NATURAL_NOTES)[number]

export type Phase = 1 | 2 | 3

export type ChallengeType =
  | 'teach'
  | 'click-the-string'
  | 'name-the-string'
  | 'click-the-note'
  | 'name-the-fret'
  | 'note-highlight'
  | 'speed-round'

export interface StringDefinition {
  stringNumber: 1 | 2 | 3 | 4 | 5 | 6
  openNote: ChromaticNote
  openOctave: number
  label: string
}

export interface FretPosition {
  stringNumber: 1 | 2 | 3 | 4 | 5 | 6
  fret: number
}

export interface NoteAtPosition extends FretPosition {
  note: ChromaticNote
  octave: number
  isNatural: boolean
}

export interface Lesson {
  id: string
  phase: Phase
  title: string
  description: string
  challengeType: ChallengeType
  targetNote?: ChromaticNote
  targetStrings?: number[]
  xpReward: number
  unlockRequirement?: string
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  bestScore: number
  stars: number
  attempts: number
  lastAttemptAt: number
}

export interface QuizQuestion {
  id: string
  type: ChallengeType
  prompt: string
  targetNote?: ChromaticNote
  targetString?: number
  targetFret?: number
  correctPositions?: FretPosition[]
  options?: string[]
  correctOption?: string
}
