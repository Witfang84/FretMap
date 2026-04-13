import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  type?: 'button' | 'submit'
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   'bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold shadow-lg shadow-amber-500/20',
  secondary: 'bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold',
  ghost:     'bg-transparent hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700',
  danger:    'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40',
  success:   'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3.5 text-lg rounded-xl',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        transition-colors duration-150 select-none
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
