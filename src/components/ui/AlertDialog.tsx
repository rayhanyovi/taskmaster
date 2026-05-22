import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import { cn } from '../../utils/cn'
import { buttonClassNames } from './buttonStyles'

export function AlertDialog(props: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root {...props} />
}

export function AlertDialogTrigger(
  props: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>,
) {
  return <AlertDialogPrimitive.Trigger {...props} />
}

export function AlertDialogPortal(
  props: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal>,
) {
  return <AlertDialogPrimitive.Portal {...props} />
}

export const AlertDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(function AlertDialogOverlay({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Overlay
      ref={ref}
      className={cn('fixed inset-0 z-50 animate-fade-in bg-slate-950/55 backdrop-blur-sm', className)}
      {...props}
    />
  )
})

export const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(function AlertDialogContent({ className, ...props }, ref) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[8px] border border-white/70 bg-white p-6 shadow-2xl outline-none data-[state=open]:animate-dialog-in dark:border-[#30363d] dark:bg-[#161b22]',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
})

export const AlertDialogHeader = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />
)

export const AlertDialogFooter = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
)

export const AlertDialogTitle = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(function AlertDialogTitle({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold text-slate-950 dark:text-[#e6edf3]', className)}
      {...props}
    />
  )
})

export const AlertDialogDescription = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn('text-sm leading-6 text-slate-500 dark:text-[#8b949e]', className)}
      {...props}
    />
  )
})

export const AlertDialogAction = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Action>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(function AlertDialogAction({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(buttonClassNames({ variant: 'destructive' }), className)}
      {...props}
    />
  )
})

export const AlertDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Cancel>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(function AlertDialogCancel({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(buttonClassNames({ variant: 'secondary' }), className)}
      {...props}
    />
  )
})
