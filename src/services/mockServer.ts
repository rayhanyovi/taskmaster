import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { STORAGE_KEYS } from '../constants/storage'
import type { AuthSession, LoginPayload } from '../types/auth'
import type { Task, TaskFormValues, TaskStatus } from '../types/task'
import { storage } from '../utils/storage'
import { findDemoAccount } from './demoCredentials'
import { consumeMockFailure } from './mockScenario'

const seedTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Review onboarding copy',
    description: 'Tighten the first-run experience and remove vague labels before submission.',
    status: 'in_progress',
    completed: false,
    createdAt: new Date('2026-05-01T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-05-01T09:00:00.000Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Finalize interview submission checklist',
    description: 'Confirm README, build output, and responsive pass before delivery.',
    status: 'completed',
    completed: true,
    createdAt: new Date('2026-05-02T11:30:00.000Z').toISOString(),
    updatedAt: new Date('2026-05-03T08:45:00.000Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Document mock API assumptions',
    description: 'Capture auth rules, localStorage schema, and optimistic update behavior.',
    status: 'todo',
    completed: false,
    createdAt: new Date('2026-05-04T14:15:00.000Z').toISOString(),
    updatedAt: new Date('2026-05-04T14:15:00.000Z').toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Prepare reviewer walkthrough',
    description: 'Keep a polished example flow ready for search, filter, and bulk actions.',
    status: 'in_progress',
    completed: false,
    createdAt: new Date('2026-05-05T08:20:00.000Z').toISOString(),
    updatedAt: new Date('2026-05-05T08:20:00.000Z').toISOString(),
  },
]

function createResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  }
}

function throwHttpError(status: number, message: string): never {
  throw { message, status }
}

function parseBody<T>(data: AxiosRequestConfig['data']) {
  if (!data) return {} as T
  if (typeof data === 'string') return JSON.parse(data) as T
  return data as T
}

function requireSession(authHeader?: string) {
  const session = storage.get<AuthSession>(STORAGE_KEYS.authSession)

  if (!session || authHeader !== `Bearer ${session.token}`) {
    throwHttpError(401, 'Unauthorized')
  }

  return session
}

function getStoredTasks() {
  const tasks = storage.get<Task[]>(STORAGE_KEYS.tasks)

  if (!tasks) {
    storage.set(STORAGE_KEYS.tasks, seedTasks)
    return seedTasks
  }

  let changed = false
  const normalizedTasks = tasks.map((task) => {
    const status = task.status ?? (task.completed ? 'completed' : 'in_progress')
    const completed = status === 'completed'

    if (task.status !== status || task.completed !== completed) {
      changed = true
    }

    return {
      ...task,
      status,
      completed,
    }
  })

  if (changed) {
    storage.set(STORAGE_KEYS.tasks, normalizedTasks)
  }

  return normalizedTasks
}

function saveTasks(tasks: Task[]) {
  storage.set(STORAGE_KEYS.tasks, tasks)
}

function maybeFail(kind: 'fetch' | 'mutation') {
  if (consumeMockFailure(kind)) {
    const message =
      kind === 'fetch'
        ? 'Simulated fetch failure. Use retry to verify recovery.'
        : 'Simulated save failure. Confirm the UI rolls back cleanly.'

    throwHttpError(500, message)
  }
}

export async function handleMockRequest(config: InternalAxiosRequestConfig) {
  const method = (config.method ?? 'get').toLowerCase()
  const url = config.url ?? '/'

  const delayMs =
    method === 'get'
      ? 850
      : method === 'post' && url === '/auth/login'
        ? 900
        : 450

  await new Promise((resolve) => window.setTimeout(resolve, delayMs))

  if (method === 'post' && url === '/auth/login') {
    const payload = parseBody<LoginPayload>(config.data)
    const account = findDemoAccount(payload)

    if (!account) {
      throwHttpError(401, 'Invalid email or password.')
    }

    const session: AuthSession = {
      email: account.email,
      token: account.token,
      loggedInAt: new Date().toISOString(),
    }

    return createResponse(config, session)
  }

  const authHeader =
    typeof config.headers.Authorization === 'string' ? config.headers.Authorization : undefined

  requireSession(authHeader)

  if (method === 'get' && url === '/tasks') {
    maybeFail('fetch')
    return createResponse(config, getStoredTasks())
  }

  if (method === 'post' && url === '/tasks') {
    maybeFail('mutation')
    const values = parseBody<TaskFormValues>(config.data)
    const tasks = getStoredTasks()
    const now = new Date().toISOString()
    const nextTask: Task = {
      id: crypto.randomUUID(),
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status ?? 'todo',
      completed: values.status === 'completed',
      createdAt: now,
      updatedAt: now,
    }

    saveTasks([nextTask, ...tasks])
    return createResponse(config, nextTask, 201)
  }

  if (method === 'post' && url === '/tasks/bulk/complete') {
    maybeFail('mutation')
    const ids = parseBody<string[]>(config.data)
    const idSet = new Set(ids)
    const now = new Date().toISOString()
    const nextTasks: Task[] = getStoredTasks().map((task) =>
      idSet.has(task.id)
        ? { ...task, status: 'completed', completed: true, updatedAt: now }
        : task,
    )

    saveTasks(nextTasks)
    return createResponse(config, nextTasks)
  }

  if (method === 'post' && url === '/tasks/bulk/delete') {
    maybeFail('mutation')
    const ids = parseBody<string[]>(config.data)
    const idSet = new Set(ids)
    const nextTasks = getStoredTasks().filter((task) => !idSet.has(task.id))
    saveTasks(nextTasks)
    return createResponse(config, ids)
  }

  const taskMatch = url.match(/^\/tasks\/([^/]+)$/)

  if (taskMatch && method === 'patch') {
    maybeFail('mutation')
    const taskId = taskMatch[1]
    const updates = parseBody<Partial<TaskFormValues & Pick<Task, 'completed'>>>(config.data)
    const tasks = getStoredTasks()
    const index = tasks.findIndex((task) => task.id === taskId)

    if (index === -1) {
      throwHttpError(404, 'Task not found.')
    }

    const current = tasks[index]
    const status: TaskStatus =
      updates.status ??
      (typeof updates.completed === 'boolean'
        ? updates.completed
          ? 'completed'
          : 'in_progress'
        : current.status)
    const updated: Task = {
      ...current,
      title: updates.title?.trim() ?? current.title,
      description: updates.description?.trim() ?? current.description,
      status,
      completed: status === 'completed',
      updatedAt: new Date().toISOString(),
    }

    const nextTasks = [...tasks]
    nextTasks[index] = updated
    saveTasks(nextTasks)

    return createResponse(config, updated)
  }

  if (taskMatch && method === 'delete') {
    maybeFail('mutation')
    const taskId = taskMatch[1]
    const nextTasks = getStoredTasks().filter((task) => task.id !== taskId)
    saveTasks(nextTasks)
    return createResponse(config, taskId)
  }

  throwHttpError(404, `No mock route defined for ${method.toUpperCase()} ${url}`)
}
