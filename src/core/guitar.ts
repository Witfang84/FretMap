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

// Equal temperament fret positions normalized to 0-1, where fret 12 = 1.0.
// Raw formula: 1 - (1/1.059463)^N gives fret 12 ≈ 0.4994, so we divide by
// that value so the last fret fills the full usable width.
export function getFretPositions(totalFrets: number = FRET_COUNT): number[] {
  const raw = Array.from({ length: totalFrets + 1 }, (_, i) =>
    1 - Math.pow(1 / 1.059463, i),
  )
  const max = raw[totalFrets]
  return raw.map((p) => p / max)
}
