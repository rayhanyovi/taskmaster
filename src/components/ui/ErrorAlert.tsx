import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './Alert'
import { Button } from './Button'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <Alert className="animate-slide-up-in border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900/60 dark:bg-red-950/20">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm dark:bg-[#21262d] dark:text-[#f85149]">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <AlertTitle className="mt-4 text-lg text-slate-950 dark:text-[#e6edf3]">Something went wrong</AlertTitle>
      <AlertDescription className="mt-2 text-red-700 dark:text-[#f85149]">{message}</AlertDescription>
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      ) : null}
    </Alert>
  )
}
