import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskSelectionStore } from './taskSelectionStore'

beforeEach(() => {
  useTaskSelectionStore.setState({ selectedIds: [], selectVisibleSnapshot: null })
})

describe('taskSelectionStore', () => {
  it('starts with empty selection', () => {
    expect(useTaskSelectionStore.getState().selectedIds).toEqual([])
  })

  describe('toggleSelection', () => {
    it('adds an id when not selected', () => {
      useTaskSelectionStore.getState().toggleSelection('a')
      expect(useTaskSelectionStore.getState().selectedIds).toContain('a')
    })

    it('removes an id when already selected', () => {
      useTaskSelectionStore.getState().toggleSelection('a')
      useTaskSelectionStore.getState().toggleSelection('a')
      expect(useTaskSelectionStore.getState().selectedIds).not.toContain('a')
    })

    it('keeps other ids when removing one', () => {
      useTaskSelectionStore.getState().toggleSelection('a')
      useTaskSelectionStore.getState().toggleSelection('b')
      useTaskSelectionStore.getState().toggleSelection('a')
      expect(useTaskSelectionStore.getState().selectedIds).toEqual(['b'])
    })
  })

  describe('selectVisible', () => {
    it('selects all visible ids when none are selected', () => {
      useTaskSelectionStore.getState().selectVisible(['a', 'b', 'c'])
      expect(useTaskSelectionStore.getState().selectedIds).toEqual(['a', 'b', 'c'])
    })

    it('deselects all visible ids when all are already selected', () => {
      useTaskSelectionStore.getState().selectVisible(['a', 'b'])
      useTaskSelectionStore.getState().selectVisible(['a', 'b'])
      expect(useTaskSelectionStore.getState().selectedIds).toEqual([])
    })

    it('merges with existing selection when not all visible are selected', () => {
      useTaskSelectionStore.getState().toggleSelection('a')
      useTaskSelectionStore.getState().selectVisible(['b', 'c'])
      const ids = useTaskSelectionStore.getState().selectedIds
      expect(ids).toContain('a')
      expect(ids).toContain('b')
      expect(ids).toContain('c')
    })

    it('deduplicates ids', () => {
      useTaskSelectionStore.getState().toggleSelection('a')
      useTaskSelectionStore.getState().selectVisible(['a', 'b'])
      const ids = useTaskSelectionStore.getState().selectedIds
      const countA = ids.filter((id) => id === 'a').length
      expect(countA).toBe(1)
    })
  })

  describe('deselectAll', () => {
    it('clears all selected ids', () => {
      useTaskSelectionStore.getState().toggleSelection('a')
      useTaskSelectionStore.getState().toggleSelection('b')
      useTaskSelectionStore.getState().deselectAll()
      expect(useTaskSelectionStore.getState().selectedIds).toEqual([])
    })
  })
})
