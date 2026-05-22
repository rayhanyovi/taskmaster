import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('rounded-[8px] border border-slate-200 bg-white text-slate-950 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3]', className)}
      {...props}
    />
  )
})

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('p-4', className)} {...props} />
  },
)
