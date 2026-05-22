import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export const Alert = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Alert(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn('rounded-[8px] border border-slate-200 bg-white p-4 text-slate-950', className)}
      {...props}
    />
  )
})

export const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function AlertTitle({ className, ...props }, ref) {
    return <h5 ref={ref} className={cn('font-medium leading-none', className)} {...props} />
  },
)

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function AlertDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn('text-sm leading-6', className)} {...props} />
  },
)
