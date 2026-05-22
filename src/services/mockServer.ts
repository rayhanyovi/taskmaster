import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { STORAGE_KEYS } from '../constants/storage'
import type { AuthSession, LoginPayload } from '../types/auth'
import type { Task, TaskFormValues, TaskStatus } from '../types/task'
import { storage } from '../utils/storage'
import { findDemoAccount } from './demoCredentials'
import { consumeMockFailure } from './mockScenario'

// ── Per-account seed data ─────────────────────────────────────────────────────
// Each account gets its own thematic starter board on first login.
// Once seeded, the board is fully isolated — changes in one account
// never bleed into another.

const seedsByEmail: Record<string, Task[]> = {
  'demo@taskmaster.local': [
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
      title: 'Finalize submission checklist',
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
    {
      id: crypto.randomUUID(),
      title: 'Align on v1 feature scope',
      description: 'Lock the feature list before dev handoff — anything not in scope gets a ticket for v2.',
      status: 'todo',
      completed: false,
      createdAt: new Date('2026-05-06T09:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-06T09:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Draft post-launch retro agenda',
      description: 'Prepare questions for what went well, what slowed us down, and what to carry forward.',
      status: 'todo',
      completed: false,
      createdAt: new Date('2026-05-07T10:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-07T10:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Set weekly sync agenda',
      description: 'Block 30 min on Mondays, prep a standing template with blockers and priorities.',
      status: 'completed',
      completed: true,
      createdAt: new Date('2026-05-08T08:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-08T11:00:00.000Z').toISOString(),
    },
  ],

  'designer@taskmaster.local': [
    {
      id: crypto.randomUUID(),
      title: 'Audit component spacing consistency',
      description: 'Walk through every card and modal — padding and gap values should follow the 4pt grid.',
      status: 'in_progress',
      completed: false,
      createdAt: new Date('2026-05-01T10:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-01T10:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Sign off on mobile layout breakpoints',
      description: 'Toolbar, kanban, and bulk bar all collapse correctly at 375px.',
      status: 'completed',
      completed: true,
      createdAt: new Date('2026-05-02T09:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-03T11:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Review empty state illustrations',
      description: 'Check that the empty board and no-results states feel intentional, not like placeholders.',
      status: 'todo',
      completed: false,
      createdAt: new Date('2026-05-04T13:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-04T13:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Check status badge contrast ratios',
      description: 'Todo, In progress, and Completed badges must meet WCAG AA against white card backgrounds.',
      status: 'todo',
      completed: false,
      createdAt: new Date('2026-05-05T09:30:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-05T09:30:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Define animation easing tokens',
      description: 'Standardise enter/exit curves and durations as design tokens so devs stop guessing.',
      status: 'in_progress',
      completed: false,
      createdAt: new Date('2026-05-06T11:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-06T11:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Review loading skeleton shapes',
      description: 'Skeleton blocks should mirror the real content layout so the shift on load feels minimal.',
      status: 'completed',
      completed: true,
      createdAt: new Date('2026-05-07T09:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-07T14:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Unify icon stroke weights',
      description: 'Mix of 1.5px and 2px stroke icons in the same view — pick one and replace the outliers.',
      status: 'todo',
      completed: false,
      createdAt: new Date('2026-05-08T10:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-08T10:00:00.000Z').toISOString(),
    },
  ],

  'engineer@taskmaster.local': [
    {
      id: crypto.randomUUID(),
      title: 'Add coverage for auth edge cases',
      description: 'Expired token, missing header, and mismatched token should all return 401 with the right message.',
      status: 'in_progress',
      completed: false,
      createdAt: new Date('2026-05-01T08:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-01T08:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Set up pre-commit lint hooks',
      description: 'ESLint and tsc --noEmit should both run on staged files before any commit lands.',
      status: 'completed',
      completed: true,
      createdAt: new Date('2026-05-02T10:30:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-03T09:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Profile bundle for unused dependencies',
      description: 'Run rollup-plugin-visualizer and check if any Radix primitives are imported but never rendered.',
      status: 'todo',
      completed: false,
      createdAt: new Date('2026-05-04T15:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-04T15:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Refactor mock server into route registry',
      description: 'Replace the if-else chain with a map of { method + pattern → handler } for easier extension.',
      status: 'todo',
      completed: false,
      createdAt: new Date('2026-05-05T10:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-05T10:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Migrate to stricter tsconfig settings',
      description: 'Enable noUncheckedIndexedAccess and exactOptionalPropertyTypes, fix the callsites that break.',
      status: 'completed',
      completed: true,
      createdAt: new Date('2026-05-06T09:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-06T16:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Document component prop contracts',
      description: 'Every shared primitive needs a JSDoc comment on its props interface before the next sprint.',
      status: 'todo',
      completed: false,
      createdAt: new Date('2026-05-07T11:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-07T11:00:00.000Z').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Investigate Select re-render on keystroke',
      description: 'Radix Select inside TaskForm seems to re-render the entire form on each keystroke in the title input.',
      status: 'in_progress',
      completed: false,
      createdAt: new Date('2026-05-08T09:30:00.000Z').toISOString(),
      updatedAt: new Date('2026-05-08T09:30:00.000Z').toISOString(),
    },
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Computes the per-user localStorage key for task data. */
function userTasksKey(email: string) {
  return `${STORAGE_KEYS.tasks}.${email}`
}

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

function getStoredTasks(email: string) {
  const key = userTasksKey(email)
  const tasks = storage.get<Task[]>(key)

  if (!tasks) {
    const seeds = seedsByEmail[email] ?? []
    storage.set(key, seeds)
    return seeds
  }

  let changed = false
  const normalizedTasks = tasks.map((task) => {
    const status = task.status ?? (task.completed ? 'completed' : 'in_progress')
    const completed = status === 'completed'

    if (task.status !== status || task.completed !== completed) {
      changed = true
    }

    return { ...task, status, completed }
  })

  if (changed) {
    storage.set(key, normalizedTasks)
  }

  return normalizedTasks
}

function saveTasks(email: string, tasks: Task[]) {
  storage.set(userTasksKey(email), tasks)
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

// ── Request handler ───────────────────────────────────────────────────────────

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

  // ── Public route ──────────────────────────────────────────────────────────
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

  // ── Authenticated routes ───────────────────────────────────────────────────
  // All routes below require a valid session. The email from that session
  // scopes every read/write to the current user's own task list.
  const authHeader =
    typeof config.headers.Authorization === 'string' ? config.headers.Authorization : undefined

  const { email } = requireSession(authHeader)

  if (method === 'get' && url === '/tasks') {
    maybeFail('fetch')
    return createResponse(config, getStoredTasks(email))
  }

  if (method === 'post' && url === '/tasks') {
    maybeFail('mutation')
    const values = parseBody<TaskFormValues>(config.data)
    const tasks = getStoredTasks(email)
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

    saveTasks(email, [nextTask, ...tasks])
    return createResponse(config, nextTask, 201)
  }

  if (method === 'post' && url === '/tasks/bulk/complete') {
    maybeFail('mutation')
    const ids = parseBody<string[]>(config.data)
    const idSet = new Set(ids)
    const now = new Date().toISOString()
    const nextTasks: Task[] = getStoredTasks(email).map((task) =>
      idSet.has(task.id)
        ? { ...task, status: 'completed', completed: true, updatedAt: now }
        : task,
    )

    saveTasks(email, nextTasks)
    return createResponse(config, nextTasks)
  }

  if (method === 'post' && url === '/tasks/bulk/delete') {
    maybeFail('mutation')
    const ids = parseBody<string[]>(config.data)
    const idSet = new Set(ids)
    const nextTasks = getStoredTasks(email).filter((task) => !idSet.has(task.id))
    saveTasks(email, nextTasks)
    return createResponse(config, ids)
  }

  const taskMatch = url.match(/^\/tasks\/([^/]+)$/)

  if (taskMatch && method === 'patch') {
    maybeFail('mutation')
    const taskId = taskMatch[1]
    const updates = parseBody<Partial<TaskFormValues & Pick<Task, 'completed'>>>(config.data)
    const tasks = getStoredTasks(email)
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
    saveTasks(email, nextTasks)

    return createResponse(config, updated)
  }

  if (taskMatch && method === 'delete') {
    maybeFail('mutation')
    const taskId = taskMatch[1]
    const nextTasks = getStoredTasks(email).filter((task) => task.id !== taskId)
    saveTasks(email, nextTasks)
    return createResponse(config, taskId)
  }

  throwHttpError(404, `No mock route defined for ${method.toUpperCase()} ${url}`)
}
