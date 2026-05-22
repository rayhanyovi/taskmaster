import { createStore } from 'zustand/vanilla'

export type MockScenarioKind = 'fetch' | 'mutation'

interface MockScenarioState {
  nextFailure: Record<MockScenarioKind, boolean>
}

const initialState: MockScenarioState = {
  nextFailure: {
    fetch: false,
    mutation: false,
  },
}

export const mockScenarioStore = createStore<MockScenarioState>(() => initialState)

export function armMockFailure(kind: MockScenarioKind) {
  mockScenarioStore.setState((state) => ({
    nextFailure: {
      ...state.nextFailure,
      [kind]: true,
    },
  }))
}

export function clearMockFailures() {
  mockScenarioStore.setState(initialState)
}

export function consumeMockFailure(kind: MockScenarioKind) {
  const armed = mockScenarioStore.getState().nextFailure[kind]

  if (!armed) return false

  mockScenarioStore.setState((state) => ({
    nextFailure: {
      ...state.nextFailure,
      [kind]: false,
    },
  }))

  return true
}
