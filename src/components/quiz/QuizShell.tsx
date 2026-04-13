import type { ReactNode } from 'react'
import { ProgressBar } from '../ui/ProgressBar'

interface QuizShellProps {
  children: ReactNode
  currentQuestion: number
  totalQuestions: number
  score: number
  lessonTitle: string
  timeLeft?: number | null
}

export function QuizShell({ children, currentQuestion, totalQuestions, score, lessonTitle, timeLeft }: QuizShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0a05]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-stone-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-stone-400 text-sm font-medium">{lessonTitle}</span>
            <div className="flex items-center gap-4">
              {timeLeft !== null && timeLeft !== undefined && (
                <span className={`text-sm font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                  {timeLeft}s
                </span>
              )}
              <span className="text-stone-400 text-sm">
                {currentQuestion}/{totalQuestions}
              </span>
            </div>
          </div>
          <ProgressBar value={currentQuestion} max={totalQuestions} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </div>

      {/* Score footer */}
      <div className="px-4 py-3 border-t border-stone-800 text-center">
        <span className="text-stone-500 text-sm">Score: <span className="text-amber-400 font-bold">{score}%</span></span>
      </div>
    </div>
  )
}
