import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLessonById } from '../core/curriculum'
import { useProgressStore } from '../store/progressStore'
import { ClickTheString } from '../components/quiz/challenges/ClickTheString'
import { NameTheString } from '../components/quiz/challenges/NameTheString'
import { NameTheFret } from '../components/quiz/challenges/NameTheFret'
import { ClickTheNote } from '../components/quiz/challenges/ClickTheNote'
import { NoteHighlight } from '../components/quiz/challenges/NoteHighlight'
import { SpeedRound } from '../components/quiz/challenges/SpeedRound'
import { QuizResults } from '../components/quiz/results/QuizResults'

interface ResultState {
  score: number
  correctCount: number
  totalQuestions: number
}

export function QuizRunner() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const completeLesson = useProgressStore((s) => s.completeLesson)
  const [result, setResult] = useState<ResultState | null>(null)

  const lesson = lessonId ? getLessonById(lessonId) : undefined

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        <div className="text-center">
          <p className="text-lg mb-4">Lesson not found</p>
          <button onClick={() => navigate('/')} className="text-amber-400 hover:underline">
            Go home
          </button>
        </div>
      </div>
    )
  }

  function handleComplete(score: number, correct: number, total: number) {
    completeLesson(lesson!.id, score, lesson!.xpReward)
    setResult({ score, correctCount: correct, totalQuestions: total })
  }

  if (result) {
    const xpEarned = result.score >= 70 ? lesson.xpReward : Math.round(lesson.xpReward * 0.3)
    return (
      <QuizResults
        score={result.score}
        correctCount={result.correctCount}
        totalQuestions={result.totalQuestions}
        xpEarned={xpEarned}
        lessonTitle={lesson.title}
        onNext={() => navigate('/')}
        onRetry={() => setResult(null)}
      />
    )
  }

  function renderChallenge() {
    switch (lesson!.challengeType) {
      case 'click-the-string':
        return <ClickTheString onComplete={handleComplete} />
      case 'name-the-string':
        return <NameTheString onComplete={handleComplete} />
      case 'name-the-fret':
        return (
          <NameTheFret
            targetStrings={lesson!.targetStrings ?? [1, 2, 3, 4, 5, 6]}
            onComplete={handleComplete}
          />
        )
      case 'click-the-note': {
        const variant =
          lesson!.id === '2.7' ? 'full' :
          lesson!.id === '2.4' ? 'octave' :
          'basic'
        return <ClickTheNote variant={variant} onComplete={handleComplete} />
      }
      case 'note-highlight':
        return <NoteHighlight onComplete={handleComplete} />
      case 'speed-round': {
        const phase = lesson!.phase === 1 ? 1 : 2
        const duration = lesson!.id === '2.8' ? 60 : 45
        return <SpeedRound durationSeconds={duration} phase={phase} onComplete={handleComplete} />
      }
      default:
        return <div className="text-stone-400 text-center p-8">Challenge type not implemented yet.</div>
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0a05]">
      <div className="px-4 py-3 border-b border-stone-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-stone-500 hover:text-stone-300 transition-colors text-sm"
          >
            ✕ Exit
          </button>
          <span className="text-stone-300 text-sm font-semibold">{lesson.title}</span>
          <span className="text-amber-500 text-xs font-bold">+{lesson.xpReward} XP</span>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {renderChallenge()}
      </div>
    </div>
  )
}
