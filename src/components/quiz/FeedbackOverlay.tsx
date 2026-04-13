import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackOverlayProps {
  feedback: 'correct' | 'wrong' | null
}

export function FeedbackOverlay({ feedback }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Corner flash */}
          <div
            className={`absolute inset-0 ${feedback === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'}`}
          />
          <motion.div
            className={`text-6xl md:text-8xl select-none`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            {feedback === 'correct' ? '✓' : '✗'}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
