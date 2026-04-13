import { motion } from 'framer-motion'
import { Button } from '../../ui/Button'
import { AnimatedNumber } from '../../ui/AnimatedNumber'

interface QuizResultsProps {
  score: number
  correctCount: number
  totalQuestions: number
  xpEarned: number
  lessonTitle: string
  onNext: () => void
  onRetry: () => void
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-2 justify-center my-4">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className={`text-4xl ${i <= count ? 'opacity-100' : 'opacity-20'}`}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.15, type: 'spring', damping: 10 }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  )
}

export function QuizResults({ score, correctCount, totalQuestions, xpEarned, lessonTitle, onNext, onRetry }: QuizResultsProps) {
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1
  const messages = ['Keep practicing!', 'Good job!', 'Perfect!']
  const message = messages[stars - 1]

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-[#0f0a05] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center max-w-sm w-full">
        <motion.h1
          className="text-3xl font-bold text-stone-100 mb-1"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {message}
        </motion.h1>
        <p className="text-stone-500 text-sm mb-2">{lessonTitle}</p>

        <Stars count={stars} />

        <motion.div
          className="bg-stone-900 rounded-2xl border border-stone-800 p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-6xl font-black mb-1">
            <AnimatedNumber value={score} suffix="%" className="text-amber-400" />
          </div>
          <p className="text-stone-400 text-sm">
            {correctCount} / {totalQuestions} correct
          </p>
          {xpEarned > 0 && (
            <motion.div
              className="mt-4 bg-amber-500/10 rounded-xl py-2 px-4 inline-block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
            >
              <span className="text-amber-400 font-bold text-lg">+{xpEarned} XP</span>
            </motion.div>
          )}
        </motion.div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onRetry} fullWidth>
            Try Again
          </Button>
          <Button variant="primary" onClick={onNext} fullWidth>
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
