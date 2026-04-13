import { useMemo } from 'react'
import type { FretPosition } from '../../types'
import { STANDARD_TUNING, getFretPositions, FRET_COUNT } from '../../core/guitar'
import { buildFretboard, positionsMatch } from '../../core/fretboard'
import { FretboardString } from './FretboardString'
import { FretMarkers } from './FretMarkers'
import { FretboardLegend } from './FretboardLegend'
import type { DotState } from './FretDot'

export type FretboardMode = 'teach' | 'quiz' | 'display'

interface FretboardProps {
  mode: FretboardMode
  interactive?: boolean
  highlightPositions?: FretPosition[]
  correctPositions?: FretPosition[]
  wrongPositions?: FretPosition[]
  foundPositions?: FretPosition[]
  targetPositions?: FretPosition[]
  onFretClick?: (pos: FretPosition) => void
  showStringLabels?: boolean
  highlightedString?: number
  dimUnhighlighted?: boolean
}

// SVG viewport constants
const SVG_WIDTH = 900
const SVG_PADDING_LEFT = 85   // room for open-string dots + legend (increased for larger labels)
const SVG_PADDING_RIGHT = 25
const SVG_PADDING_TOP = 42    // gap: fret-number text bottom → board top ≥ 10 SVG units
const SVG_PADDING_BOTTOM = 52 // gap: board bottom → inlay dot centre ≥ 14 SVG units
const STRING_AREA_HEIGHT = 168 // 168/5 = 33.6 SVG units per string; fits r=12 dots with ~8px gap
const BOARD_HEIGHT = SVG_PADDING_TOP + STRING_AREA_HEIGHT + SVG_PADDING_BOTTOM

// String thicknesses: index 0 = E1 (thinnest), index 5 = E6 (thickest)
const STRING_THICKNESSES = [1, 1.5, 2, 2.5, 3, 3.5]

export function Fretboard({
  mode,
  interactive = false,
  highlightPositions = [],
  correctPositions = [],
  wrongPositions = [],
  foundPositions = [],
  targetPositions = [],
  onFretClick,
  showStringLabels = false,
  highlightedString,
  dimUnhighlighted = false,
}: FretboardProps) {
  const fretboard = useMemo(() => buildFretboard(), [])

  // Equal-temperament fret X positions (relative 0-1 → scaled to usable width)
  const usableWidth = SVG_WIDTH - SVG_PADDING_LEFT - SVG_PADDING_RIGHT
  const nutX = SVG_PADDING_LEFT
  const rawFretPositions = useMemo(() => getFretPositions(FRET_COUNT), [])
  // rawFretPositions[0] = 0 (nut), rawFretPositions[12] = ~0.5
  // We want the FRET LINES, so we skip index 0 (nut) and use 1-12
  const fretLineXPositions = useMemo(
    () => rawFretPositions.slice(1).map((p) => nutX + p * usableWidth),
    [rawFretPositions, nutX, usableWidth],
  )

  // String Y positions: evenly spaced within STRING_AREA_HEIGHT
  const stringYPositions = useMemo(() => {
    const n = STANDARD_TUNING.length
    return STANDARD_TUNING.map((_, i) => {
      const spacing = STRING_AREA_HEIGHT / (n - 1)
      return SVG_PADDING_TOP + i * spacing
    })
  }, [])

  function getDotState(pos: FretPosition): DotState {
    if (correctPositions.some((p) => positionsMatch(p, pos))) return 'correct'
    if (wrongPositions.some((p) => positionsMatch(p, pos))) return 'wrong'
    if (foundPositions.some((p) => positionsMatch(p, pos))) return 'found'
    if (targetPositions.some((p) => positionsMatch(p, pos))) return 'target'
    if (highlightPositions.some((p) => positionsMatch(p, pos))) return 'highlight'
    return 'default'
  }

  // Show note names inside dots in all non-quiz modes (teach + display)
  const showLabels = mode !== 'quiz'

  const viewBox = `0 0 ${SVG_WIDTH} ${BOARD_HEIGHT}`

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={viewBox}
        className="w-full"
        style={{ maxHeight: '310px', minWidth: '320px' }}
        aria-label="Guitar fretboard"
        role="img"
      >
        {/* Fretboard background */}
        <rect
          x={nutX}
          y={SVG_PADDING_TOP - 8}
          width={usableWidth}
          height={STRING_AREA_HEIGHT + 16}
          fill="#2c1e0f"
          rx={4}
        />

        {/* Fret lines */}
        {fretLineXPositions.map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={SVG_PADDING_TOP - 8}
            x2={x}
            y2={SVG_PADDING_TOP + STRING_AREA_HEIGHT + 8}
            stroke="#6b5a45"
            strokeWidth={i === 11 ? 2.5 : 1.5}
          />
        ))}

        {/* Nut */}
        <rect
          x={nutX - 6}
          y={SVG_PADDING_TOP - 8}
          width={6}
          height={STRING_AREA_HEIGHT + 16}
          fill="#d4c4a0"
          rx={2}
        />

        {/* Strings and dots */}
        {STANDARD_TUNING.map((stringDef, i) => {
          const isDimmed = dimUnhighlighted && highlightedString !== undefined && highlightedString !== stringDef.stringNumber
          return (
            <g key={stringDef.stringNumber} opacity={isDimmed ? 0.3 : 1}>
              <FretboardString
                notes={fretboard[i]}
                stringY={stringYPositions[i]}
                fretXPositions={fretLineXPositions}
                nutX={nutX}
                stringThickness={STRING_THICKNESSES[i]}
                interactive={interactive && (!dimUnhighlighted || highlightedString === stringDef.stringNumber)}
                showLabels={showLabels}
                getDotState={getDotState}
                onFretClick={onFretClick}
              />
            </g>
          )
        })}

        {/* Position inlay markers */}
        <FretMarkers
          fretXPositions={fretLineXPositions}
          svgHeight={SVG_PADDING_TOP + STRING_AREA_HEIGHT}
          nutX={nutX}
        />

        {/* String name legend (only in teach mode) */}
        {(mode === 'teach' || showStringLabels) && (
          <FretboardLegend
            stringYPositions={stringYPositions}
            nutX={nutX}
            highlightedString={highlightedString}
          />
        )}

        {/* Fret numbers */}
        {[3, 5, 7, 9, 12].map((fret) => {
          const x0 = fret === 1 ? nutX : fretLineXPositions[fret - 2]
          const x1 = fretLineXPositions[fret - 1]
          const midX = (x0 + x1) / 2
          return (
            <text
              key={fret}
              x={midX}
              y={SVG_PADDING_TOP - 18}
              textAnchor="middle"
              fontSize="16"
              fill="#8b7a65"
              fontWeight="600"
            >
              {fret}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
