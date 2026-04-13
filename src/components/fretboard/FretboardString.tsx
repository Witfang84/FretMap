import type { FretPosition, NoteAtPosition } from '../../types'
import { FretDot } from './FretDot'
import type { DotState } from './FretDot'

interface FretboardStringProps {
  notes: NoteAtPosition[]
  stringY: number
  fretXPositions: number[]
  nutX: number
  stringThickness: number
  interactive: boolean
  showLabels: boolean
  getDotState: (pos: FretPosition) => DotState
  onFretClick?: (pos: FretPosition) => void
}

export function FretboardString({
  notes,
  stringY,
  fretXPositions,
  nutX,
  stringThickness,
  interactive,
  showLabels,
  getDotState,
  onFretClick,
}: FretboardStringProps) {
  const dotR = 9

  // Calculate X center for a given fret position
  function getDotX(fret: number): number {
    if (fret === 0) {
      // Open string dot sits just to the left of the nut
      return nutX - 20
    }
    const x0 = fret === 1 ? nutX : fretXPositions[fret - 2]
    const x1 = fretXPositions[fret - 1]
    return (x0 + x1) / 2
  }

  return (
    <g>
      {/* String line */}
      <line
        x1={nutX}
        y1={stringY}
        x2={fretXPositions[fretXPositions.length - 1]}
        y2={stringY}
        stroke="#c8b89a"
        strokeWidth={stringThickness}
        strokeLinecap="round"
      />
      {/* Fret dots */}
      {notes.map((note) => {
        const cx = getDotX(note.fret)
        const state = getDotState({ stringNumber: note.stringNumber, fret: note.fret })
        return (
          <FretDot
            key={`${note.stringNumber}-${note.fret}`}
            position={{ stringNumber: note.stringNumber, fret: note.fret }}
            state={state}
            interactive={interactive}
            label={note.note}
            showLabel={showLabels && state !== 'default'}
            onClick={onFretClick}
            cx={cx}
            cy={stringY}
            r={dotR}
          />
        )
      })}
    </g>
  )
}
