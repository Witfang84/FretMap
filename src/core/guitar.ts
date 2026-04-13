import type { StringDefinition } from '../types'

export const STANDARD_TUNING: StringDefinition[] = [
  { stringNumber: 1, openNote: 'E', openOctave: 4, label: 'E1' },
  { stringNumber: 2, openNote: 'B', openOctave: 3, label: 'B2' },
  { stringNumber: 3, openNote: 'G', openOctave: 3, label: 'G3' },
  { stringNumber: 4, openNote: 'D', openOctave: 3, label: 'D4' },
  { stringNumber: 5, openNote: 'A', openOctave: 2, label: 'A5' },
  { stringNumber: 6, openNote: 'E', openOctave: 2, label: 'E6' },
]

export const FRET_COUNT = 12

// Equal temperament fret positions (normalized 0-1) for 12 frets
// Position of fret N = 1 - (1/1.059463)^N
export function getFretPositions(totalFrets: number = FRET_COUNT): number[] {
  const positions: number[] = []
  for (let i = 0; i <= totalFrets; i++) {
    positions.push(1 - Math.pow(1 / 1.059463, i))
  }
  return positions
}
