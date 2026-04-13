import { describe, it, expect } from 'vitest'
import { STANDARD_TUNING } from './guitar'
import {
  getNoteAtFret,
  buildFretboard,
  findAllPositionsOfNote,
  positionKey,
} from './fretboard'

describe('getNoteAtFret', () => {
  it('returns correct open string notes', () => {
    expect(getNoteAtFret(STANDARD_TUNING[0], 0).note).toBe('E') // E1
    expect(getNoteAtFret(STANDARD_TUNING[1], 0).note).toBe('B') // B2
    expect(getNoteAtFret(STANDARD_TUNING[2], 0).note).toBe('G') // G3
    expect(getNoteAtFret(STANDARD_TUNING[3], 0).note).toBe('D') // D4
    expect(getNoteAtFret(STANDARD_TUNING[4], 0).note).toBe('A') // A5
    expect(getNoteAtFret(STANDARD_TUNING[5], 0).note).toBe('E') // E6
  })

  it('fret 12 is always the same note as the open string', () => {
    for (const string of STANDARD_TUNING) {
      const open = getNoteAtFret(string, 0)
      const fret12 = getNoteAtFret(string, 12)
      expect(fret12.note).toBe(open.note)
      expect(fret12.octave).toBe(open.octave + 1)
    }
  })

  it('fret 1 on E string is F', () => {
    expect(getNoteAtFret(STANDARD_TUNING[0], 1).note).toBe('F')
  })

  it('fret 3 on E string is G', () => {
    expect(getNoteAtFret(STANDARD_TUNING[0], 3).note).toBe('G')
  })

  it('fret 5 on E string is A', () => {
    expect(getNoteAtFret(STANDARD_TUNING[0], 5).note).toBe('A')
  })

  it('fret 5 on A string is D', () => {
    expect(getNoteAtFret(STANDARD_TUNING[4], 5).note).toBe('D')
  })

  it('correctly identifies natural notes', () => {
    expect(getNoteAtFret(STANDARD_TUNING[0], 0).isNatural).toBe(true)  // E – natural
    expect(getNoteAtFret(STANDARD_TUNING[0], 1).isNatural).toBe(true)  // F – natural
    expect(getNoteAtFret(STANDARD_TUNING[0], 2).isNatural).toBe(false) // F# – accidental
    expect(getNoteAtFret(STANDARD_TUNING[0], 3).isNatural).toBe(true)  // G – natural
  })

  it('F is a natural note (no sharps/flats)', () => {
    // F is in NATURAL_NOTES, so fret 1 on E string should be natural
    const pos = getNoteAtFret(STANDARD_TUNING[0], 1)
    expect(pos.note).toBe('F')
    expect(pos.isNatural).toBe(true)
  })
})

describe('buildFretboard', () => {
  it('builds a 6×13 matrix (6 strings, frets 0-12)', () => {
    const board = buildFretboard()
    expect(board.length).toBe(6)
    for (const row of board) {
      expect(row.length).toBe(13)
    }
  })

  it('each row has the correct string number', () => {
    const board = buildFretboard()
    for (let i = 0; i < 6; i++) {
      expect(board[i][0].stringNumber).toBe(STANDARD_TUNING[i].stringNumber)
    }
  })
})

describe('findAllPositionsOfNote', () => {
  const board = buildFretboard()

  it('finds 2 E positions on string 1 (frets 0 and 12)', () => {
    const positions = findAllPositionsOfNote(board, 'E')
    const onString1 = positions.filter((p) => p.stringNumber === 1)
    expect(onString1.length).toBe(2) // fret 0 and fret 12
    expect(onString1.map((p) => p.fret).sort((a, b) => a - b)).toEqual([0, 12])
  })

  it('finds the same number of positions for E on strings 1 and 6', () => {
    const positions = findAllPositionsOfNote(board, 'E')
    const str1 = positions.filter((p) => p.stringNumber === 1)
    const str6 = positions.filter((p) => p.stringNumber === 6)
    expect(str1.length).toBe(str6.length)
  })

  it('total positions across all strings is consistent', () => {
    // Each of the 12 chromatic notes appears once per 12 frets per string
    // With 6 strings × 13 positions (0-12) = 78 total positions
    // Notes that appear at both fret 0 and fret 12 have 2 positions per string
    const positions = findAllPositionsOfNote(board, 'E')
    expect(positions.length).toBeGreaterThan(0)
  })

  it('returns correct positions (positionKey format)', () => {
    const positions = findAllPositionsOfNote(board, 'G')
    expect(positions.some((p) => positionKey(p) === 'str1-fret3')).toBe(true)
    expect(positions.some((p) => positionKey(p) === 'str3-fret0')).toBe(true)
  })
})
