import { motion } from 'framer-motion'

interface QuizPromptProps {
  text: string
  subtext?: string
}

export function QuizPrompt({ text, subtext }: QuizPromptProps) {
  return (
    <motion.div
      className="text-center mb-6"
      key={text}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-stone-100 leading-tight">{text}</h2>
      {subtext && (
        <p className="text-stone-400 mt-2 text-sm md:text-base">{subtext}</p>
      )}
    </motion.div>
  )
}
