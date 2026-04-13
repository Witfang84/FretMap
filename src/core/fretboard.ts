import { CHROMATIC, NATURAL_NOTES } from '../types'
import type { ChromaticNote, FretPosition, NoteAtPosition, StringDefinition } from '../types'
import { STANDARD_TUNING, FRET_COUNT } from './guitar'

export function getNoteAtFret(stringDef: StringDefinition, fret: number): NoteAtPosition {
  const openIndex = CHROMATIC.indexOf(stringDef.openNote)
  const semitones = openIndex + fret
  const noteIndex = semitones % 12
  const octaveOffset = Math.floor(semitones / 12)
  const note = CHROMATIC[noteIndex]
  return {
    stringNumber: stringDef.stringNumber,
    fret,
    note,
    octave: stringDef.openOctave + octaveOffset,
    isNatural: (NATURAL_NOTES as readonly string[]).includes(note),
  }
}

export function buildFretboard(
  tuning: StringDefinition[] = STANDARD_TUNING,
  fretCount: number = FRET_COUNT,
): NoteAtPosition[][] {
  return tuning.map((string) =>
    Array.from({ length: fretCount + 1 }, (_, fret) => getNoteAtFret(string, fret)),
  )
}

export function findAllPositionsOfNote(
  fretboard: NoteAtPosition[][],
  targetNote: ChromaticNote,
  maxFret: number = FRET_COUNT,
): FretPosition[] {
  return fretboard.flatMap((string) =>
    string
      .filter((pos) => pos.fret <= maxFret && pos.note === targetNote)
      .map((pos) => ({ stringNumber: pos.stringNumber, fret: pos.fret })),
  )
}

export function positionKey(pos: FretPosition): string {
  return `str${pos.stringNumber}-fret${pos.fret}`
}

export function positionsMatch(a: FretPosition, b: FretPosition): boolean {
  return a.stringNumber === b.stringNumber && a.fret === b.fret
}

// Get natural note positions only (for Phase 2 challenges)
export function findAllNaturalPositions(
  fretboard: NoteAtPosition[][],
  maxFret: number = FRET_COUNT,
): NoteAtPosition[] {
  return fretboard.flatMap((string) =>
    string.filter((pos) => pos.fret <= maxFret && pos.isNatural),
  )
}

// Get all positions for a specific string
export function getStringPositions(
  fretboard: NoteAtPosition[][],
  stringNumber: number,
  maxFret: number = FRET_COUNT,
): NoteAtPosition[] {
  const row = fretboard.find((s) => s[0]?.stringNumber === stringNumber)
  if (!row) return []
  return row.filter((pos) => pos.fret <= maxFret)
}
