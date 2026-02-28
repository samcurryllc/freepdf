import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'motion/react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  size?: 'sm' | 'md'
  tooltip?: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ active, size = 'md', tooltip, className = '', children, ...props }, ref) => {
    // Mobile: larger touch targets (44px min). Desktop: compact.
    const sizeClass = size === 'sm' ? 'w-9 h-9 md:w-8 md:h-8' : 'w-10 h-10 md:w-9 md:h-9'
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.92 }}
        title={tooltip}
        className={`inline-flex items-center justify-center rounded-lg transition-colors
          ${active ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
          disabled:opacity-40 disabled:pointer-events-none
          ${sizeClass} ${className}`}
        {...(props as any)}
      >
        {children}
      </motion.button>
    )
  }
)
