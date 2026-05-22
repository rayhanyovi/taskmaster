import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:placeholder:text-[#6e7681] dark:focus:border-[#58a6ff] dark:focus:ring-[#58a6ff]/20',
        className,
      )}
      {...props}
    />
  )
})
