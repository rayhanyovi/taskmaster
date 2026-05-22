import { create } from 'zustand'

interface TaskSelectionState {
  selectedIds: string[]
  selectVisibleSnapshot: string[] | null
  toggleSelection: (id: string) => void
  selectVisible: (ids: string[]) => void
  deselectAll: () => void
}

export const useTaskSelectionStore = create<TaskSelectionState>((set, get) => ({
  selectedIds: [],
  selectVisibleSnapshot: null,
  toggleSelection: (id) => {
    const selectedIds = get().selectedIds
    const exists = selectedIds.includes(id)
    set({
      selectedIds: exists
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
      selectVisibleSnapshot: null,
    })
  },
  selectVisible: (ids) => {
    const { selectedIds, selectVisibleSnapshot } = get()
    const allVisibleSelected = ids.every((id) => selectedIds.includes(id))

    if (allVisibleSelected) {
      set({
        selectedIds:
          selectVisibleSnapshot ??
          selectedIds.filter((selectedId) => !ids.includes(selectedId)),
        selectVisibleSnapshot: null,
      })
      return
    }

    set({
      selectedIds: Array.from(new Set([...selectedIds, ...ids])),
      selectVisibleSnapshot: selectedIds,
    })
  },
  deselectAll: () => set({ selectedIds: [], selectVisibleSnapshot: null }),
}))
