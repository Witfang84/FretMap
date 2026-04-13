import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LessonProgress } from '../types'
import { positionKey } from '../core/fretboard'
import type { FretPosition } from '../types'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

interface ProgressState {
  lessonProgress: Record<string, LessonProgress>
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  totalXP: number
  positionWeights: Record<string, number>

  // Computed
  level: () => number
  isLessonUnlocked: (lessonId: string, unlockRequirement?: string) => boolean

  // Actions
  completeLesson: (lessonId: string, score: number, xpReward: number) => void
  recordAnswer: (pos: FretPosition, correct: boolean) => void
  checkAndUpdateStreak: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      lessonProgress: {},
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      totalXP: 0,
      positionWeights: {},

      level: () => Math.floor(get().totalXP / 100) + 1,

      isLessonUnlocked: (_lessonId: string, unlockRequirement?: string) => {
        if (!unlockRequirement) return true
        const req = get().lessonProgress[unlockRequirement]
        return req?.completed === true
      },

      completeLesson: (lessonId, score, xpReward) => {
        set((state) => {
          const existing = state.lessonProgress[lessonId]
          const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1
          const isFirstCompletion = !existing?.completed
          const isHigherScore = !existing || score > existing.bestScore

          const xpEarned = isFirstCompletion
            ? xpReward + (stars === 3 ? 25 : stars === 2 ? 10 : 0)
            : stars === 3 && (existing?.stars ?? 0) < 3
              ? 25
              : 0

          return {
            lessonProgress: {
              ...state.lessonProgress,
              [lessonId]: {
                lessonId,
                completed: true,
                bestScore: isHigherScore ? score : (existing?.bestScore ?? score),
                stars: Math.max(stars, existing?.stars ?? 0),
                attempts: (existing?.attempts ?? 0) + 1,
                lastAttemptAt: Date.now(),
              },
            },
            totalXP: state.totalXP + xpEarned,
          }
        })
        get().checkAndUpdateStreak()
      },

      recordAnswer: (pos, correct) => {
        set((state) => {
          const key = positionKey(pos)
          const current = state.positionWeights[key] ?? 0.5
          const updated = correct
            ? Math.max(0.1, current * 0.8)
            : Math.min(1.0, current * 1.5)
          return {
            positionWeights: { ...state.positionWeights, [key]: updated },
          }
        })
      },

      checkAndUpdateStreak: () => {
        set((state) => {
          const today = todayISO()
          if (state.lastActiveDate === today) return {}

          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().slice(0, 10)

          const newStreak =
            state.lastActiveDate === yesterdayStr ? state.currentStreak + 1 : 1

          return {
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActiveDate: today,
          }
        })
      },
    }),
    { name: 'fretmap-progress' },
  ),
)
