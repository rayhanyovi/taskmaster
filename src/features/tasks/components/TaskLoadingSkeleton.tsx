import { Card, CardContent } from '../../../components/ui/Card'
import { Skeleton } from '../../../components/ui/Skeleton'

export function TaskLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className="border-slate-200 bg-white/95"
        >
          <CardContent className="flex items-start gap-4">
            <Skeleton className="mt-1 h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3 bg-slate-100" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
