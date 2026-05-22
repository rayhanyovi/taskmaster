# TaskMaster

TaskMaster is a polished offline-first task manager built as a frontend technical assessment submission. It runs entirely in the browser, persists to `localStorage`, and hides that persistence behind a mock API so the UI still exercises realistic async loading, auth, mutation, rollback, and error flows.

## What It Shows

- SPA auth flow: `/` shows a login card when signed out and the workspace when signed in
- Three demo accounts with persisted mock sessions
- Task CRUD through a mock Axios API layer
- `todo`, `in_progress`, and `completed` task statuses
- List and Kanban views, including drag-and-drop status changes in Kanban
- Debounced search across title and description
- Status filters for all, pending, and completed tasks
- Long-press bulk selection with select-all-visible, bulk complete, and bulk delete
- Task detail dialog for viewing, updating, or deleting a task
- shadcn/Radix-style UI primitives for cards, dialogs, dropdowns, select, checkbox, badges, alerts, and buttons
- Reviewer scenario lab for simulated fetch/save failures and account switching
- Loading skeletons, empty states, error states, confirmation dialogs, animations, and toast feedback
- Production bundle chunking for React, Radix, data libraries, and app code

## Assessment Alignment

| Rubric Area | Implementation |
|---|---|
| Architecture | Feature-first folders, shared UI primitives, typed services, mock API abstraction, and no direct storage access from components |
| State + Async | Zustand for app/UI state, TanStack Query for task server-state, optimistic mutations, rollback, retries, and debounced search |
| Code Quality | TypeScript status model, React Hook Form + Zod validation, reusable dialogs/menus/cards, and accessible Radix primitives |
| UI/UX | SPA auth, responsive list/Kanban views, drag-and-drop, bulk selection, scenario lab, loading/error/empty states, and subtle animations |

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Product Lead | `demo@taskmaster.local` | `password123` |
| Design Reviewer | `designer@taskmaster.local` | `design123` |
| Engineering Owner | `engineer@taskmaster.local` | `build123` |

## Live Demo

The project is deployed on Vercel:

https://taskflow-yovi.vercel.app

No environment variables are required. The app uses a browser-only mock API and persists data to `localStorage`.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 + Vite | UI and build tooling |
| TypeScript | Static typing |
| Tailwind CSS 4 | Styling |
| React Router | SPA routing |
| TanStack React Query | Async task fetching, cache invalidation, optimistic updates |
| Zustand | UI state for auth, filters, view mode, and selection |
| Axios | Shared API client with mock adapter and auth interceptor |
| React Hook Form + Zod | Login form and task form validation |
| Radix UI | shadcn-style accessible primitives |
| react-hot-toast | Toast notifications |
| lucide-react | Icons |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

### Verify

```bash
# Type-check + production build
npm run lint
npm run build

# Unit & component tests (Vitest)
npm test

# Unit tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests — requires npm run dev running or auto-starts via webServer config
npm run test:e2e

# E2E with interactive UI
npm run test:e2e:ui
```

## Project Structure

```text
src/
├── app/                    # App shell, providers, router
├── components/ui/          # shadcn/Radix-style shared primitives
├── constants/              # Storage keys
├── features/
│   ├── auth/               # Login form, auth bootstrap, auth store
│   └── tasks/              # Dashboard, task UI, hooks, task stores
├── services/               # Mock API, auth, tasks, Axios client
├── types/                  # Shared TS types and task status constants
└── utils/                  # Storage wrapper and className helper
```

## Architecture Notes

### SPA Auth

The app intentionally avoids a separate login page. `AuthBootstrap` restores the persisted session, then the root route renders either the login card or the task workspace. Logging out clears the mock session and returns the user to the same root route in signed-out mode.

### Mock API Layer

Components never read or write `localStorage` directly. Feature code calls `authService` and `taskService`, which call a shared Axios client. That client injects the mock bearer token, simulates latency, routes requests through mock handlers, and persists data through a storage utility.

### React Query + Zustand

React Query owns task server-state: fetches, loading/error states, invalidation, optimistic updates, and rollback. Zustand owns UI state: auth session, filters, view mode, and selected task ids.

### Status Model

Tasks use a shared `TASK_STATUSES` constant and `TaskStatus` type:

```ts
todo | in_progress | completed
```

The legacy `completed` boolean is still stored for compatibility with earlier localStorage data, but `status` is the UI source of truth.

### Interaction Details

- Search is debounced before updating filter state.
- Clicking a task opens the detail dialog in normal mode.
- Long-pressing a task enters bulk selection mode.
- In selection mode, clicking anywhere on a task toggles selection.
- Kanban cards can be dragged across lanes to update status.
- Delete flows use confirmation dialogs rather than native browser prompts.

## Reviewer Scenario Lab

The floating scenario lab can:

- Arm a one-time fetch failure
- Arm a one-time mutation failure
- Reset armed failures
- Reload tasks
- Switch between demo accounts by calling the mock login API with prewritten credentials

This makes loading, error, retry, toast, and rollback behavior easy to verify without changing code.

## Testing

| Layer | Tool | Scope |
|---|---|---|
| Unit tests | Vitest + jsdom | Pure utils, Zustand stores, mock API handler |
| Component tests | Vitest + Testing Library | TaskFilterTabs, TaskItem, EmptyState, ErrorAlert |
| E2E tests | Playwright (Chromium) | Auth flows, task CRUD, filters, search, bulk actions |

The unit tests use `vi.useFakeTimers()` to advance through the mock API's simulated latency without real waiting. The E2E suite starts the dev server automatically via `webServer` in `playwright.config.ts`.

Run the full test suite:

```bash
npm test              # unit + component (73 tests)
npm run test:e2e      # E2E browser tests (needs npm run dev or auto-starts)
```

## Known Limitations

- Persistence is browser-local and shared across demo accounts
- No real backend or network I/O
- No due dates, tags, subtasks, or dark mode

## Future Improvements

- Replace mock services with a real API
- Scope task data per account if the demo grows beyond reviewer scenarios
- Add due dates or tags once the base workflow is locked
