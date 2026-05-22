import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskFilterStore } from './taskFilterStore'

beforeEach(() => {
  useTaskFilterStore.setState({ searchKeyword: '', filterStatus: 'all', viewMode: 'kanban' })
})

describe('taskFilterStore', () => {
  it('has correct initial state', () => {
    const state = useTaskFilterStore.getState()
    expect(state.searchKeyword).toBe('')
    expect(state.filterStatus).toBe('all')
    expect(state.viewMode).toBe('kanban')
  })

  it('setSearchKeyword updates the keyword', () => {
    useTaskFilterStore.getState().setSearchKeyword('hello')
    expect(useTaskFilterStore.getState().searchKeyword).toBe('hello')
  })

  it('setFilterStatus updates the filter', () => {
    useTaskFilterStore.getState().setFilterStatus('pending')
    expect(useTaskFilterStore.getState().filterStatus).toBe('pending')

    useTaskFilterStore.getState().setFilterStatus('completed')
    expect(useTaskFilterStore.getState().filterStatus).toBe('completed')
  })

  it('setViewMode switches between kanban and list', () => {
    useTaskFilterStore.getState().setViewMode('list')
    expect(useTaskFilterStore.getState().viewMode).toBe('list')

    useTaskFilterStore.getState().setViewMode('kanban')
    expect(useTaskFilterStore.getState().viewMode).toBe('kanban')
  })

  it('resetFilters clears keyword and resets status to all', () => {
    useTaskFilterStore.getState().setSearchKeyword('abc')
    useTaskFilterStore.getState().setFilterStatus('completed')
    useTaskFilterStore.getState().resetFilters()

    const state = useTaskFilterStore.getState()
    expect(state.searchKeyword).toBe('')
    expect(state.filterStatus).toBe('all')
  })

  it('resetFilters does not reset viewMode', () => {
    useTaskFilterStore.getState().setViewMode('list')
    useTaskFilterStore.getState().resetFilters()
    expect(useTaskFilterStore.getState().viewMode).toBe('list')
  })
})
