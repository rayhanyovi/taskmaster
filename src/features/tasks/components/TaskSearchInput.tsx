import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '../../../components/ui/Input'
import { useTaskFilterStore } from '../store/taskFilterStore'

export function TaskSearchInput() {
  const searchKeyword = useTaskFilterStore((state) => state.searchKeyword)
  const setSearchKeyword = useTaskFilterStore((state) => state.setSearchKeyword)
  const [draft, setDraft] = useState(searchKeyword)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearchKeyword(draft), 250)
    return () => window.clearTimeout(timeoutId)
  }, [draft, setSearchKeyword])

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#6e7681]" />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search tasks"
        className="border-white/60 bg-white/90 pl-9 pr-9"
      />
      {draft ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:text-[#6e7681] dark:hover:text-[#e6edf3]"
          onClick={() => {
            setDraft('')
            setSearchKeyword('')
          }}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
