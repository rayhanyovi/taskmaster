import { create } from 'zustand'
import type { TaskFilterStatus, TaskViewMode } from '../../../types/task'

interface TaskFilterState {
  searchKeyword: string
  filterStatus: TaskFilterStatus
  viewMode: TaskViewMode
  setSearchKeyword: (searchKeyword: string) => void
  setFilterStatus: (filterStatus: TaskFilterStatus) => void
  setViewMode: (viewMode: TaskViewMode) => void
  resetFilters: () => void
}

export const useTaskFilterStore = create<TaskFilterState>((set) => ({
  searchKeyword: '',
  filterStatus: 'all',
  viewMode: 'kanban',
  setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setViewMode: (viewMode) => set({ viewMode }),
  resetFilters: () => set({ searchKeyword: '', filterStatus: 'all' }),
}))
