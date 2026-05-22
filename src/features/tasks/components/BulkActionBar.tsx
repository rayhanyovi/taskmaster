import { ListChecks, Trash2, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'

interface BulkActionBarProps {
  visibleIds: string[]
  selectedIds: string[]
  onSelectVisible: (ids: string[]) => void
  onCompleteSelected: () => void
  onDeleteSelected: () => void
  onClear: () => void
  isWorking: boolean
}

export function BulkActionBar({
  visibleIds,
  selectedIds,
  onSelectVisible,
  onCompleteSelected,
  onDeleteSelected,
  onClear,
  isWorking,
}: BulkActionBarProps) {
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length

  if (selectedIds.length === 0) return null

  return (
    <Card className="animate-slide-up-in flex flex-col gap-3 border-sky-200 bg-sky-50 p-3 md:flex-row md:items-center md:justify-between dark:border-[#58a6ff]/20 dark:bg-[#161b22]">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-semibold text-sky-800 ring-1 ring-sky-200 transition-colors hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100 dark:bg-[#21262d] dark:text-[#58a6ff] dark:ring-[#58a6ff]/30 dark:hover:bg-[#30363d]"
          onClick={() => onSelectVisible(visibleIds)}
        >
          <span
            className={cn(
              'grid h-4 w-4 place-items-center rounded border bg-white shadow-sm transition-colors',
              allVisibleSelected
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-sky-300 text-transparent',
            )}
            aria-hidden="true"
          >
            <ListChecks className="h-3 w-3" />
          </span>
          Select all visible
        </button>
        <span className="whitespace-nowrap rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-950 dark:bg-[#21262d] dark:text-[#58a6ff]">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button
          variant="secondary"
          className="shrink-0 gap-2"
          disabled={isWorking}
          onClick={onCompleteSelected}
        >
          <ListChecks className="h-4 w-4" />
          Complete Selected
        </Button>
        <Button
          variant="danger"
          className="shrink-0 gap-2"
          disabled={isWorking}
          onClick={onDeleteSelected}
        >
          <Trash2 className="h-4 w-4" />
          Delete Selected
        </Button>
        <Button
          variant="ghost"
          className="shrink-0 gap-2 text-slate-600 hover:bg-white hover:text-slate-900"
          disabled={isWorking}
          onClick={onClear}
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </Card>
  )
}
