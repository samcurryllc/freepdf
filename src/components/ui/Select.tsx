import { type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export function Select({ options, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700
        focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
        transition-colors ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
