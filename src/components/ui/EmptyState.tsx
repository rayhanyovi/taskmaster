import { ClipboardList } from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent } from './Card'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="animate-slide-up-in border-dashed border-slate-300 bg-white/90 text-center">
      <CardContent className="px-6 py-12">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm">
          <ClipboardList className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
        {actionLabel && onAction ? (
          <Button className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
