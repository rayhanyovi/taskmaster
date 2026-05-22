import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export const Badge = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Badge(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ring-1',
        className,
      )}
      {...props}
    />
  )
})
