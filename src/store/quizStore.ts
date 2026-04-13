import { create } from 'zustand'
import type { QuizQuestion, FretPosition } from '../types'

interface QuizState {
  lessonId: string | null
  questions: QuizQuestion[]
  currentIndex: number
  score: number
  correctCount: number
  wrongCount: number
  selectedPositions: FretPosition[]
  lastFeedback: 'correct' | 'wrong' | null
  isComplete: boolean
  timeLeft: number | null

  // Actions
  startQuiz: (lessonId: string, questions: QuizQuestion[]) => void
  submitAnswer: (answer: string | FretPosition) => boolean
  addFoundPosition: (pos: FretPosition) => void
  nextQuestion: () => void
  resetQuiz: () => void
  setTimeLeft: (t: number) => void
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  lessonId: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  selectedPositions: [],
  lastFeedback: null,
  isComplete: false,
  timeLeft: null,

  startQuiz: (lessonId, questions) =>
    set({
      lessonId,
      questions,
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      selectedPositions: [],
      lastFeedback: null,
      isComplete: false,
      timeLeft: null,
    }),

  submitAnswer: (answer) => {
    const { questions, currentIndex, correctCount, wrongCount } = get()
    const q = questions[currentIndex]
    if (!q) return false

    let correct = false
    if (typeof answer === 'string') {
      correct = answer === q.correctOption
    } else {
      // FretPosition answer for click challenges
      correct = q.correctPositions?.some(
        (p) => p.stringNumber === (answer as FretPosition).stringNumber && p.fret === (answer as FretPosition).fret,
      ) ?? false
    }

    const newCorrect = correct ? correctCount + 1 : correctCount
    const newWrong = correct ? wrongCount : wrongCount + 1
    const total = questions.length
    const newScore = Math.round((newCorrect / total) * 100)

    set({
      correctCount: newCorrect,
      wrongCount: newWrong,
      score: newScore,
      lastFeedback: correct ? 'correct' : 'wrong',
    })

    return correct
  },

  addFoundPosition: (pos) =>
    set((state) => ({
      selectedPositions: [...state.selectedPositions, pos],
    })),

  nextQuestion: () =>
    set((state) => {
      const next = state.currentIndex + 1
      return {
        currentIndex: next,
        selectedPositions: [],
        lastFeedback: null,
        isComplete: next >= state.questions.length,
      }
    }),

  resetQuiz: () =>
    set({
      lessonId: null,
      questions: [],
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      selectedPositions: [],
      lastFeedback: null,
      isComplete: false,
      timeLeft: null,
    }),

  setTimeLeft: (t) => set({ timeLeft: t }),
}))
