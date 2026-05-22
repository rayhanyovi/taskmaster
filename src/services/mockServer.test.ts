import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'
import { handleMockRequest } from './mockServer'
import { storage } from '../utils/storage'
import { STORAGE_KEYS } from '../constants/storage'
import type { AuthSession, LoginPayload } from '../types/auth'
import type { Task, TaskFormValues } from '../types/task'

function makeConfig(
  method: string,
  url: string,
  data?: unknown,
  token?: string,
): InternalAxiosRequestConfig {
  return {
    method,
    url,
    data: data !== undefined ? JSON.stringify(data) : undefined,
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  } as unknown as InternalAxiosRequestConfig
}

const TEST_TOKEN = 'taskmaster-demo-token-product'

async function call(method: string, url: string, data?: unknown, token = TEST_TOKEN) {
  const promise = handleMockRequest(makeConfig(method, url, data, token))
  // Attach an immediate no-op catch so Node.js doesn't flag a brief
  // "unhandled rejection" window while fake timers are being advanced.
  promise.catch(() => {})
  await vi.runAllTimersAsync()
  return promise
}

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()

  const session: AuthSession = {
    email: 'demo@taskmaster.local',
    token: TEST_TOKEN,
    loggedInAt: new Date().toISOString(),
  }
  storage.set(STORAGE_KEYS.authSession, session)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('POST /auth/login', () => {
  it('returns a session for valid credentials', async () => {
    const payload: LoginPayload = { email: 'demo@taskmaster.local', password: 'password123' }
    const response = await call('post', '/auth/login', payload, '')
    expect(response.status).toBe(200)
    expect(response.data).toMatchObject({ email: 'demo@taskmaster.local' })
    expect((response.data as AuthSession).token).toBeTruthy()
  })

  it('throws 401 for invalid credentials', async () => {
    const payload: LoginPayload = { email: 'demo@taskmaster.local', password: 'wrong' }
    await expect(call('post', '/auth/login', payload, '')).rejects.toMatchObject({ status: 401 })
  })

  it('throws 401 for unknown email', async () => {
    const payload: LoginPayload = { email: 'nobody@test.com', password: 'pass' }
    await expect(call('post', '/auth/login', payload, '')).rejects.toMatchObject({ status: 401 })
  })
})

describe('GET /tasks', () => {
  it('returns the seeded task list on first call', async () => {
    const response = await call('get', '/tasks')
    expect(response.status).toBe(200)
    const tasks = response.data as Task[]
    expect(tasks.length).toBeGreaterThan(0)
    expect(tasks[0]).toHaveProperty('id')
    expect(tasks[0]).toHaveProperty('title')
    expect(tasks[0]).toHaveProperty('status')
  })

  it('returns 401 when no auth token is provided', async () => {
    await expect(call('get', '/tasks', undefined, '')).rejects.toMatchObject({ status: 401 })
  })

  it('returns 401 for invalid token', async () => {
    await expect(call('get', '/tasks', undefined, 'bad-token')).rejects.toMatchObject({ status: 401 })
  })
})

describe('POST /tasks', () => {
  it('creates a new task and returns it with 201', async () => {
    const values: TaskFormValues = { title: 'Test task', description: 'Details', status: 'todo' }
    const response = await call('post', '/tasks', values)
    const task = response.data as Task
    expect(response.status).toBe(201)
    expect(task.title).toBe('Test task')
    expect(task.description).toBe('Details')
    expect(task.status).toBe('todo')
    expect(task.id).toBeTruthy()
  })

  it('trims title and description whitespace', async () => {
    const values: TaskFormValues = { title: '  Trim me  ', description: '  also  ', status: 'todo' }
    const response = await call('post', '/tasks', values)
    const task = response.data as Task
    expect(task.title).toBe('Trim me')
    expect(task.description).toBe('also')
  })

  it('prepends new task to the list', async () => {
    const values: TaskFormValues = { title: 'First', description: '', status: 'todo' }
    await call('post', '/tasks', values)

    const listResponse = await call('get', '/tasks')
    const tasks = listResponse.data as Task[]
    expect(tasks[0].title).toBe('First')
  })
})

describe('PATCH /tasks/:id', () => {
  it('updates the task and returns updated data', async () => {
    const listResponse = await call('get', '/tasks')
    const tasks = listResponse.data as Task[]
    const id = tasks[0].id

    const patchResponse = await call('patch', `/tasks/${id}`, { title: 'Updated title' })
    const updated = patchResponse.data as Task
    expect(updated.id).toBe(id)
    expect(updated.title).toBe('Updated title')
  })

  it('updates the status field', async () => {
    const listResponse = await call('get', '/tasks')
    const tasks = listResponse.data as Task[]
    const task = tasks.find((t) => t.status !== 'completed')!

    const patchResponse = await call('patch', `/tasks/${task.id}`, { status: 'completed' })
    const updated = patchResponse.data as Task
    expect(updated.status).toBe('completed')
    expect(updated.completed).toBe(true)
  })

  it('returns 404 for unknown task id', async () => {
    await expect(call('patch', '/tasks/nonexistent-id', { title: 'x' })).rejects.toMatchObject({
      status: 404,
    })
  })
})

describe('DELETE /tasks/:id', () => {
  it('removes the task and returns its id', async () => {
    const listResponse = await call('get', '/tasks')
    const tasks = listResponse.data as Task[]
    const id = tasks[0].id

    const deleteResponse = await call('delete', `/tasks/${id}`)
    expect(deleteResponse.data).toBe(id)

    const afterResponse = await call('get', '/tasks')
    const afterTasks = afterResponse.data as Task[]
    expect(afterTasks.find((t) => t.id === id)).toBeUndefined()
  })
})

describe('POST /tasks/bulk/complete', () => {
  it('marks all specified tasks as completed', async () => {
    const listResponse = await call('get', '/tasks')
    const tasks = listResponse.data as Task[]
    const ids = tasks.slice(0, 2).map((t) => t.id)

    const bulkResponse = await call('post', '/tasks/bulk/complete', ids)
    const updated = bulkResponse.data as Task[]
    const updatedTargets = updated.filter((t) => ids.includes(t.id))
    expect(updatedTargets.every((t) => t.status === 'completed')).toBe(true)
  })
})

describe('POST /tasks/bulk/delete', () => {
  it('removes all specified tasks', async () => {
    const listResponse = await call('get', '/tasks')
    const tasks = listResponse.data as Task[]
    const ids = tasks.slice(0, 2).map((t) => t.id)

    await call('post', '/tasks/bulk/delete', ids)

    const afterResponse = await call('get', '/tasks')
    const afterTasks = afterResponse.data as Task[]
    for (const id of ids) {
      expect(afterTasks.find((t) => t.id === id)).toBeUndefined()
    }
  })
})

describe('unknown routes', () => {
  it('throws 404 for unrecognised method/url', async () => {
    await expect(call('get', '/unknown-route')).rejects.toMatchObject({ status: 404 })
  })
})
