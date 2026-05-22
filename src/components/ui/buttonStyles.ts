import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface ButtonStyleProps {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'danger' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'icon'
  className?: ButtonHTMLAttributes<HTMLButtonElement>['className']
}

const variantClasses: Record<NonNullable<ButtonStyleProps['variant']>, string> = {
  default:
    'bg-slate-900 text-slate-50 shadow-sm hover:bg-slate-800 focus-visible:outline-slate-900',
  primary:
    'bg-sky-500 text-white shadow-sm hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-md focus-visible:outline-sky-500',
  secondary:
    'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-slate-400',
  destructive:
    'bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md focus-visible:outline-red-600',
  danger:
    'bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md focus-visible:outline-red-600',
  ghost:
    'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-slate-400',
  outline:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-slate-400',
}

const sizeClasses: Record<NonNullable<ButtonStyleProps['size']>, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  icon: 'h-9 w-9 px-0',
}

export function buttonClassNames({
  variant = 'primary',
  size = 'default',
  className,
}: ButtonStyleProps = {}) {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
