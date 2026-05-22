import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:placeholder:text-[#6e7681] dark:focus:border-[#58a6ff] dark:focus:ring-[#58a6ff]/20',
          className,
        )}
        {...props}
      />
    )
  },
)
