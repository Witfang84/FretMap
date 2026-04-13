// Position dot inlays (standard guitar fret markers)
const SINGLE_DOTS = [3, 5, 7, 9]
const DOUBLE_DOT = 12

interface FretMarkersProps {
  fretXPositions: number[]
  svgHeight: number
  nutX: number
}

export function FretMarkers({ fretXPositions, svgHeight, nutX }: FretMarkersProps) {
  const markerY = svgHeight + 22
  const dotR = 6

  function getMidX(fret: number): number {
    const x0 = fret <= 1 ? nutX : fretXPositions[fret - 2]
    const x1 = fretXPositions[fret - 1]
    return (x0 + x1) / 2
  }

  return (
    <g>
      {SINGLE_DOTS.map((fret) => (
        <circle
          key={fret}
          cx={getMidX(fret)}
          cy={markerY}
          r={dotR}
          fill="#6b5a45"
        />
      ))}
      {/* Double dot at 12 */}
      <circle cx={getMidX(DOUBLE_DOT) - 6} cy={markerY} r={dotR} fill="#6b5a45" />
      <circle cx={getMidX(DOUBLE_DOT) + 6} cy={markerY} r={dotR} fill="#6b5a45" />
    </g>
  )
}
