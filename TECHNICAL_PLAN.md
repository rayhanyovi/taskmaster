# TaskMaster — Comprehensive Technical Plan

> **Document Purpose:** This is a step-by-step technical blueprint for building the TaskMaster app. It is written so that ANY developer or coding agent (even one with limited context) can follow it from start to finish and produce a working, polished result in 1 day.

> **Implementation Note:** This document is the original planning blueprint. The current implementation intentionally evolved beyond it: auth is now an SPA card on `/`, tasks support `todo | in_progress | completed`, Kanban drag-and-drop is implemented, and UI primitives have been migrated to shadcn/Radix-style components. Use `README.md` as the current source of truth.

---

## Table of Contents

1. [Scope Definition](#1-scope-definition)
2. [Recommended App Design](#2-recommended-app-design)
3. [Folder Structure](#3-folder-structure)
4. [Data Model](#4-data-model)
5. [LocalStorage Strategy](#5-localstorage-strategy)
6. [Auth Flow](#6-auth-flow)
7. [React Query Strategy](#7-react-query-strategy)
8. [Zustand Store Strategy](#8-zustand-store-strategy)
9. [Form Strategy](#9-form-strategy)
10. [Component Breakdown](#10-component-breakdown)
11. [Implementation Steps](#11-implementation-steps)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [README Plan](#13-readme-plan)
14. [Extra Point Suggestions](#14-extra-point-suggestions)
15. [Risk Management](#15-risk-management)
16. [Enhancement Pass](#16-enhancement-pass)

---

## 1. Scope Definition

### What This Project IS

TaskMaster is a **single-user, offline-only** task management app built as a frontend take-home interview project. Everything runs in the browser. There is NO real backend server. LocalStorage acts as the "database," and a mock API layer simulates real server behavior (latency, auth checks, error responses).

The goal is to demonstrate:
- Clean React architecture with proper separation of concerns
- Professional async state management (React Query + Zustand)
- Thoughtful UI/UX with loading, error, and empty states
- Type-safe code with TypeScript and Zod validation
- A well-documented README explaining all decisions

### What IS In Scope (Build These)

| Feature | Priority |
|---|---|
| Mock login with hardcoded credentials | **MUST** |
| Session persistence across page refresh | **MUST** |
| Protected route (redirect to login if not authenticated) | **MUST** |
| Logout | **MUST** |
| View task list (fetched via mock API with simulated latency) | **MUST** |
| Create a new task | **MUST** |
| Edit a task (title, description, completed status) | **MUST** |
| Delete a task | **MUST** |
| Mark task as completed / incomplete (toggle) | **MUST** |
| Global search by keyword (title + description) | **MUST** |
| Filter by status: All / Completed / Incomplete | **MUST** |
| Loading skeletons during fetch | **MUST** |
| Error state UI with retry option | **MUST** |
| Empty state UI when no tasks exist | **MUST** |
| Toast notifications for success/error feedback | **SHOULD** |
| Optimistic updates for toggle complete and delete | **SHOULD** |
| Seed data (pre-populated tasks on first visit) | **SHOULD** |
| Multi-select + bulk complete/delete | **NICE-TO-HAVE** |
| Responsive mobile layout | **SHOULD** |
| Professional README | **MUST** |

### What Is NOT In Scope (Do NOT Build These)

- Real backend server or API
- Real database (Postgres, MongoDB, etc.)
- User registration / sign-up flow
- Role-based access control (admin/user roles)
- Multiple user accounts
- Team collaboration or sharing
- Drag and drop reordering
- Calendar or date-picker scheduling
- Push notifications
- Complex analytics or dashboard charts
- Complex design system or component library
- Dark mode toggle (use light mode only — keeps scope small)
- File uploads or attachments on tasks
- Subtasks or nested tasks
- Tags or categories on tasks
- Undo/redo system

---

## 2. Recommended App Design

### Design Philosophy

The UI should feel clean, minimal, and functional — like a real productivity tool, not a random template. Think of Linear, Todoist, or Notion's simplicity.

### Color Palette (Tailwind CSS classes)

```
Primary Background:    bg-gray-50          (page background)
Card/Surface:          bg-white            (cards, modals, forms)
Primary Accent:        bg-indigo-600       (buttons, active tab)
Primary Hover:         bg-indigo-700       (button hover)
Text Primary:          text-gray-900       (headings, task titles)
Text Secondary:        text-gray-500       (descriptions, metadata)
Border:                border-gray-200     (card borders, dividers)
Success:               bg-emerald-50, text-emerald-700   (completed badge)
Danger:                bg-red-50, text-red-700           (delete actions)
Warning/Error:         bg-amber-50, text-amber-700       (error toast)
```

### Typography

- Use Tailwind's default `font-sans` (Inter if loaded, system stack otherwise)
- Headings: `text-2xl font-bold` for page title
- Task titles: `text-sm font-medium`
- Descriptions: `text-sm text-gray-500`
- Buttons: `text-sm font-medium`

### Page Layouts

#### Login Page (`/login`)

```
┌─────────────────────────────────────────────┐
│                                             │
│              (centered card)                │
│    ┌──────────────────────────────┐         │
│    │      TaskMaster        │         │
│    │      "Manage your tasks"     │         │
│    │                              │         │
│    │  Email:    [____________]    │         │
│    │  Password: [____________]    │         │
│    │                              │         │
│    │  [ Login Button ]            │         │
│    │                              │         │
│    │  Demo: demo@taskmaster.local   │         │
│    │        password123           │         │
│    └──────────────────────────────┘         │
│                                             │
│           bg-gray-50 full screen            │
└─────────────────────────────────────────────┘
```

- Centered vertically and horizontally: `min-h-screen flex items-center justify-center bg-gray-50`
- Card: `bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm`
- Show demo credentials below the form as a small hint (helps evaluators)
- Show validation errors inline below each field in `text-red-500 text-xs`
- Show server error (wrong password) as a red banner at the top of the form
- Login button shows a spinner while loading

#### Dashboard Page (`/`)

```
┌─────────────────────────────────────────────────────┐
│  HEADER BAR                                         │
│  TaskMaster              user@email  [Logout] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  TOOLBAR                                      │  │
│  │  [Search____________]  [All|Active|Completed] │  │
│  │                              [ + New Task ]   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  BULK ACTION BAR (only when items selected)   │  │
│  │  "3 selected"  [✓ Complete] [✗ Delete] [Clear]│  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  TASK LIST                                    │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │ [☐] Task Title         [Edit] [Delete]   │ │  │
│  │  │     Description text • Jan 1, 2025       │ │  │
│  │  ├──────────────────────────────────────────┤ │  │
│  │  │ [☑] Completed Task     [Edit] [Delete]   │ │  │
│  │  │     Description text • Jan 2, 2025       │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  (or EMPTY STATE if no tasks)                       │
│  (or LOADING SKELETONS if fetching)                 │
│  (or ERROR STATE if fetch fails)                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Header:** `bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between`

**Main Content Area:** `max-w-3xl mx-auto px-4 py-6` (centered, not full-width)

**Task Item Row:**
- Container: `bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-3 hover:border-gray-300 transition-colors`
- Completed tasks: title gets `line-through text-gray-400`
- Checkbox: a round checkbox, styled with `w-5 h-5 rounded-full border-2 border-gray-300` and when checked: `bg-indigo-600 border-indigo-600` with a checkmark
- Action buttons: `text-gray-400 hover:text-gray-600` icon buttons (pencil for edit, trash for delete)

**Filter Tabs:**
- Use pill-style tabs: `flex gap-1 bg-gray-100 rounded-lg p-1`
- Active tab: `bg-white rounded-md shadow-sm text-gray-900 font-medium px-3 py-1.5 text-sm`
- Inactive tab: `text-gray-500 px-3 py-1.5 text-sm hover:text-gray-700`

**Task Form (Create/Edit):**
- Use a modal or an inline expandable section (modal is recommended for polish)
- Modal: `fixed inset-0 bg-black/50 flex items-center justify-center`
- Form card: `bg-white rounded-xl p-6 w-full max-w-md shadow-xl`
- Fields: Title (required), Description (optional textarea)
- Buttons: "Cancel" (secondary) and "Save Task" (primary)

**Empty State:**
- Center a friendly illustration or icon
- Text: "No tasks yet" with `text-gray-500`
- Subtext: "Create your first task to get started"
- A "Create Task" button

**Loading Skeleton:**
- 3-5 skeleton rows with `animate-pulse bg-gray-200 rounded` blocks
- Mimic the shape of a real TaskItem (checkbox area + title line + description line)

**Error State:**
- Red-tinted card: `bg-red-50 border border-red-200 rounded-lg p-6 text-center`
- Error message + "Try Again" button

**Toast Notifications:**
- Position: top-right, `fixed top-4 right-4 z-50`
- Use a simple custom toast or install `react-hot-toast` (lightweight, 5KB)
- Success: green left-border. Error: red left-border.
- Auto-dismiss after 3 seconds

### Responsive Design

- Desktop: `max-w-3xl mx-auto` centered layout
- Tablet: Same layout, narrower
- Mobile (<640px): Full-width with `px-4`, stack toolbar items vertically, reduce font sizes
- Use `sm:` and `md:` Tailwind breakpoints where needed
- Task action buttons collapse to an ellipsis "..." menu on mobile (OPTIONAL — only if time permits)

---

## 3. Folder Structure

```
src/
├── app/
│   ├── App.tsx                 # Root component: sets up Router, QueryClientProvider, Toaster
│   ├── routes.tsx              # Route definitions (login, dashboard)
│   └── providers.tsx           # Wraps all providers (QueryClient, etc.)
│
├── components/
│   └── ui/                     # Shared presentational UI components
│       ├── Button.tsx          # Reusable button (variant: primary, secondary, danger, ghost)
│       ├── Input.tsx           # Styled input wrapper
│       ├── Modal.tsx           # Generic modal overlay
│       ├── Spinner.tsx         # Small loading spinner
│       ├── EmptyState.tsx      # Empty state with icon + message + optional action
│       ├── ErrorAlert.tsx      # Error display with retry button
│       └── Toast.tsx           # (or just use react-hot-toast setup)
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.tsx         # Login form with RHF + Zod
│   │   ├── hooks/
│   │   │   └── useAuth.ts            # Custom hook wrapping auth store
│   │   ├── pages/
│   │   │   └── LoginPage.tsx         # Full login page
│   │   └── store/
│   │       └── authStore.ts          # Zustand auth store
│   │
│   └── tasks/
│       ├── components/
│       │   ├── TaskToolbar.tsx        # Search + filter + "new task" button
│       │   ├── TaskSearchInput.tsx    # Search input field
│       │   ├── TaskFilterTabs.tsx     # All / Active / Completed tabs
│       │   ├── TaskList.tsx           # Maps over tasks, renders TaskItem
│       │   ├── TaskItem.tsx           # Single task row
│       │   ├── TaskForm.tsx           # Create/edit form (inside modal)
│       │   ├── TaskFormModal.tsx      # Modal wrapper for TaskForm
│       │   ├── BulkActionBar.tsx      # Bulk action bar (shows when items selected)
│       │   └── TaskLoadingSkeleton.tsx # Skeleton loading placeholder
│       ├── hooks/
│       │   ├── useTasks.ts           # React Query hook for fetching tasks
│       │   ├── useCreateTask.ts      # React Query mutation hook
│       │   ├── useUpdateTask.ts      # React Query mutation hook
│       │   ├── useDeleteTask.ts      # React Query mutation hook
│       │   └── useBulkActions.ts     # React Query mutation hooks for bulk ops
│       ├── pages/
│       │   └── DashboardPage.tsx     # Full dashboard page (composes all task components)
│       └── store/
│           ├── taskFilterStore.ts    # Zustand store: search keyword + filter status
│           └── taskSelectionStore.ts # Zustand store: selected task IDs for bulk actions
│
├── layouts/
│   ├── AppLayout.tsx           # Layout with header (used by dashboard)
│   └── ProtectedRoute.tsx      # Checks auth, redirects to /login if not authenticated
│
├── lib/
│   ├── axios.ts                # Axios instance with interceptors
│   └── queryClient.ts          # React Query client configuration
│
├── services/
│   ├── authService.ts          # Mock auth API functions (login, logout, getSession)
│   └── taskService.ts          # Mock task API functions (getTasks, createTask, etc.)
│
├── types/
│   └── index.ts                # All TypeScript types/interfaces
│
├── utils/
│   ├── storage.ts              # LocalStorage helper functions (get, set, remove)
│   ├── delay.ts                # Simulated latency helper
│   └── seedData.ts             # Initial seed tasks
│
├── main.tsx                    # Vite entry point
└── index.css                   # Tailwind directives + any global styles
```

### What Each Folder Does

| Folder | Purpose | Rule |
|---|---|---|
| `app/` | Application setup: root component, routing, provider wiring | Only setup code here, no feature logic |
| `components/ui/` | Shared, **presentational** UI primitives | No business logic. No API calls. No store access. Just props in, JSX out. |
| `features/auth/` | Everything related to authentication | Login form, auth store, auth page, auth hooks |
| `features/tasks/` | Everything related to tasks | Task components, task hooks (React Query), task stores (Zustand), task page |
| `layouts/` | Page layouts and route guards | AppLayout wraps authenticated pages. ProtectedRoute checks auth. |
| `lib/` | Library configurations | Axios instance, React Query client — configured once, imported everywhere |
| `services/` | Mock API layer | ALL LocalStorage reads/writes happen here. Simulates latency and auth checks. Returns Promise-based responses. |
| `types/` | TypeScript type definitions | Shared types used across the app |
| `utils/` | Pure utility functions | Storage helpers, delay function, seed data |

### Key Architecture Rules (IMPORTANT — follow these strictly)

1. **Components NEVER import from `utils/storage.ts` directly.** Only `services/` files read/write LocalStorage.
2. **Components NEVER call `localStorage` directly.** Everything goes through the services layer.
3. **`services/` functions ALWAYS return Promises** (to simulate async API calls).
4. **React Query hooks live in `features/*/hooks/`.** Components call these hooks, not the services directly.
5. **Zustand stores hold UI state only** (search keyword, filter, selected IDs, auth session). Task data lives in React Query cache.

---

## 4. Data Model

### File: `src/types/index.ts`

```typescript
// ========================
// USER & AUTH
// ========================

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  user: User;
  token: string; // A fake JWT-like string, e.g., "fake-jwt-token-xyz"
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ========================
// TASK
// ========================

export interface Task {
  id: string;           // UUID v4 string (use crypto.randomUUID())
  title: string;        // Required, 1-100 characters
  description: string;  // Optional in form, but always a string (empty string if not provided)
  completed: boolean;   // false by default
  createdAt: string;    // ISO 8601 string, e.g., "2025-01-15T10:30:00.000Z"
  updatedAt: string;    // ISO 8601 string, updated on every edit
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

// ========================
// FILTER
// ========================

export type TaskFilterStatus = 'all' | 'active' | 'completed';
// NOTE: "active" means completed === false (i.e., incomplete/pending tasks)

// ========================
// API RESPONSE SHAPES
// ========================

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
}
```

### Why NO Priority or Due Date

Adding a `priority` field (low/medium/high) or `dueDate` field would require:
- Extra form UI (dropdown or date picker)
- Sort logic
- Visual indicators
- More filtering options

This adds at least 1-2 hours of work for minimal interview value. The evaluator cares more about clean async handling and good architecture than extra data fields. **Skip it.**

---

## 5. LocalStorage Strategy

### LocalStorage Keys

| Key | Value Type | Purpose |
|---|---|---|
| `taskmaster_auth_session` | `JSON string of AuthSession \| null` | Persisted login session (user + token) |
| `taskmaster_tasks` | `JSON string of Task[]` | All tasks |

### Helper Functions — `src/utils/storage.ts`

```typescript
const STORAGE_KEYS = {
  AUTH_SESSION: 'taskmaster_auth_session',
  TASKS: 'taskmaster_tasks',
} as const;

export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};

export { STORAGE_KEYS };
```

### Seed Data — `src/utils/seedData.ts`

On app startup (or when taskService first reads tasks and finds nothing), seed LocalStorage with 5-8 sample tasks. This ensures the evaluator sees a populated app immediately.

```typescript
export const SEED_TASKS: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Review project requirements',
    description: 'Go through the technical spec and identify key deliverables',
    completed: true,
    createdAt: '2025-01-10T09:00:00.000Z',
    updatedAt: '2025-01-10T14:00:00.000Z',
  },
  {
    id: crypto.randomUUID(),
    title: 'Set up development environment',
    description: 'Install Node.js, create Vite project, configure TypeScript and Tailwind',
    completed: true,
    createdAt: '2025-01-11T08:00:00.000Z',
    updatedAt: '2025-01-11T10:00:00.000Z',
  },
  {
    id: crypto.randomUUID(),
    title: 'Implement authentication flow',
    description: 'Build login page with form validation and session management',
    completed: false,
    createdAt: '2025-01-12T09:00:00.000Z',
    updatedAt: '2025-01-12T09:00:00.000Z',
  },
  {
    id: crypto.randomUUID(),
    title: 'Build task CRUD operations',
    description: '',
    completed: false,
    createdAt: '2025-01-13T10:00:00.000Z',
    updatedAt: '2025-01-13T10:00:00.000Z',
  },
  {
    id: crypto.randomUUID(),
    title: 'Write unit tests',
    description: 'Add tests for critical business logic and components',
    completed: false,
    createdAt: '2025-01-14T11:00:00.000Z',
    updatedAt: '2025-01-14T11:00:00.000Z',
  },
  {
    id: crypto.randomUUID(),
    title: 'Deploy to production',
    description: 'Deploy the app to Vercel or Netlify and verify everything works',
    completed: false,
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
  },
];
```

### How Data Flows (IMPORTANT — Read This Carefully)

```
UI Component
    ↓ calls
React Query Hook (e.g., useTasks)
    ↓ calls
Service Function (e.g., taskService.getTasks)
    ↓ reads/writes
LocalStorage (via storage helper)
    ↓ returns
Promise<ApiResponse<Task[]>>
    ↓ returned to
React Query (caches the data)
    ↓ provides to
UI Component (via hook return value)
```

**The golden rule:** UI components have ZERO knowledge of LocalStorage. They only know about React Query hooks. React Query hooks only know about service functions. Service functions are the ONLY code that touches LocalStorage.

---

## 6. Auth Flow

### Hardcoded Credentials

```typescript
// Inside src/services/authService.ts
const MOCK_USER = {
  id: '1',
  email: 'demo@taskmaster.local',
  password: 'password123', // Only used for comparison, never stored
  name: 'Demo User',
};

const FAKE_TOKEN = 'fake-jwt-token-taskmaster-2025';
```

### Detailed Auth Flow Diagram

```
App Starts
    │
    ▼
Check localStorage for "taskmaster_auth_session"
    │
    ├── Found valid session ──────► Zustand authStore.setSession(session)
    │                                    │
    │                                    ▼
    │                              User lands on Dashboard (/)
    │                              Axios interceptor attaches token to all requests
    │
    └── No session found ─────────► Redirect to /login
                                         │
                                         ▼
                                   User enters email + password
                                         │
                                         ▼
                                   React Hook Form validates with Zod:
                                   - email: valid email format
                                   - password: min 1 character (not empty)
                                         │
                                         ├── Validation fails ──► Show inline errors
                                         │
                                         └── Validation passes ──► Call authService.login()
                                                                         │
                                              ┌──────────────────────────┤
                                              │                          │
                                        Credentials match          Credentials don't match
                                              │                          │
                                              ▼                          ▼
                                        Return { user, token }    Throw error:
                                              │                   "Invalid email or password"
                                              ▼                          │
                                        authStore.setSession()           ▼
                                        Save to localStorage       Show error banner
                                              │                   on the login form
                                              ▼
                                        Navigate to /
                                        (React Router navigate)
```

### Logout Flow

```
User clicks "Logout"
    │
    ▼
authStore.logout()
    │
    ├── Remove session from Zustand state (set to null)
    ├── Remove "taskmaster_auth_session" from localStorage
    ├── Clear React Query cache (queryClient.clear())
    └── Navigate to /login
```

### Axios Interceptor — `src/lib/axios.ts`

```typescript
import axios from 'axios';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type { AuthSession } from '../types';

const apiClient = axios.create({
  baseURL: '/api', // fake base URL, doesn't matter since we intercept everything
});

// REQUEST interceptor: attach token to every request
apiClient.interceptors.request.use((config) => {
  const session = storage.get<AuthSession>(STORAGE_KEYS.AUTH_SESSION);
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// RESPONSE interceptor: handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      storage.remove(STORAGE_KEYS.AUTH_SESSION);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**IMPORTANT NOTE:** Since we are using mock services (not real HTTP calls), the Axios interceptors are set up for demonstration purposes. The mock service functions will read the token from localStorage directly to simulate auth checking. The interceptors show the evaluator that you know how to set them up in a real app.

### Auth Service — `src/services/authService.ts`

```typescript
// Pseudocode — implement this as real TypeScript

function login(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === MOCK_USER.email && credentials.password === MOCK_USER.password) {
        const session: AuthSession = {
          user: { id: MOCK_USER.id, email: MOCK_USER.email, name: MOCK_USER.name },
          token: FAKE_TOKEN,
        };
        storage.set(STORAGE_KEYS.AUTH_SESSION, session);
        resolve({ data: session, message: 'Login successful' });
      } else {
        reject({ message: 'Invalid email or password', status: 401 });
      }
    }, 800); // Simulate 800ms network latency
  });
}

function logout(): void {
  storage.remove(STORAGE_KEYS.AUTH_SESSION);
}

function getSession(): AuthSession | null {
  return storage.get<AuthSession>(STORAGE_KEYS.AUTH_SESSION);
}
```

### Zustand Auth Store — `src/features/auth/store/authStore.ts`

```typescript
// Pseudocode structure

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
  initialize: () => void; // Called on app start to hydrate from localStorage
}

// On create:
// - initialize() reads from localStorage and sets session
// - setSession() saves to state AND localStorage
// - logout() clears state AND localStorage
```

### Protected Route — `src/layouts/ProtectedRoute.tsx`

```typescript
// Pseudocode

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children; // or <Outlet /> if using layout routes
}
```

---

## 7. React Query Strategy

### Query Client Configuration — `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes (data is considered fresh for 5 min)
      retry: 1,                    // Retry failed requests once
      refetchOnWindowFocus: false,  // Don't refetch on tab focus (we're offline)
    },
  },
});
```

### Query Keys

Use a consistent key factory pattern:

```typescript
// Define in src/features/tasks/hooks/ or a shared constants file

export const taskKeys = {
  all:    ['tasks'] as const,           // Used for all task queries
  list:   () => [...taskKeys.all, 'list'] as const,  // For the task list query
};
```

There is only ONE query (the task list), so keys are simple. But using a factory pattern shows good practice.

### Fetching Tasks — `useTasks.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../../services/taskService';
import { taskKeys } from './queryKeys';

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.list(),
    queryFn: taskService.getTasks,
    // Returns: { data, isLoading, isError, error, refetch }
  });
}
```

**In the component:**
```
const { data: tasks, isLoading, isError, error, refetch } = useTasks();

if (isLoading) return <TaskLoadingSkeleton />;
if (isError)   return <ErrorAlert message={error.message} onRetry={refetch} />;
if (!tasks?.length) return <EmptyState />;
return <TaskList tasks={filteredTasks} />;
```

### Creating a Task — `useCreateTask.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../services/taskService';
import { taskKeys } from './queryKeys';
import toast from 'react-hot-toast';

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,  // Accepts CreateTaskInput, returns Task
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list() });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}
```

### Updating a Task (with Optimistic Update) — `useUpdateTask.ts`

```typescript
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      taskService.updateTask(id, data),

    // OPTIMISTIC UPDATE: Update the UI immediately before the "server" responds
    onMutate: async ({ id, data }) => {
      // 1. Cancel any in-flight queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: taskKeys.list() });

      // 2. Snapshot the previous value (for rollback if mutation fails)
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list());

      // 3. Optimistically update the cache
      queryClient.setQueryData<Task[]>(taskKeys.list(), (old) =>
        old?.map((task) =>
          task.id === id ? { ...task, ...data, updatedAt: new Date().toISOString() } : task
        ) ?? []
      );

      // 4. Return context with the snapshotted value
      return { previousTasks };
    },

    // If the mutation fails, roll back to the previous value
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks);
      }
      toast.error('Failed to update task');
    },

    // Always refetch after error or success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list() });
    },

    onSuccess: () => {
      toast.success('Task updated');
    },
  });
}
```

### Deleting a Task (with Optimistic Update) — `useDeleteTask.ts`

```typescript
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,  // Accepts task ID string

    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list() });
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list());

      // Optimistically remove the task from the list
      queryClient.setQueryData<Task[]>(taskKeys.list(), (old) =>
        old?.filter((task) => task.id !== taskId) ?? []
      );

      return { previousTasks };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks);
      }
      toast.error('Failed to delete task');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list() });
    },

    onSuccess: () => {
      toast.success('Task deleted');
    },
  });
}
```

### Bulk Actions — `useBulkActions.ts`

```typescript
export function useBulkComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskIds: string[]) => taskService.bulkComplete(taskIds),

    onMutate: async (taskIds) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list() });
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list());

      queryClient.setQueryData<Task[]>(taskKeys.list(), (old) =>
        old?.map((task) =>
          taskIds.includes(task.id)
            ? { ...task, completed: true, updatedAt: new Date().toISOString() }
            : task
        ) ?? []
      );

      return { previousTasks };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(), context.previousTasks);
      }
      toast.error('Failed to complete tasks');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list() });
    },

    onSuccess: (_, taskIds) => {
      toast.success(`${taskIds.length} tasks completed`);
    },
  });
}

// useBulkDelete follows the same pattern but filters out the tasks
```

### Summary Table

| Action | React Query Tool | Optimistic? | Cache Strategy |
|---|---|---|---|
| Fetch tasks | `useQuery` | N/A | Cache with 5min staleTime |
| Create task | `useMutation` | No (invalidate) | Invalidate list query |
| Update task | `useMutation` | **Yes** | Optimistic update + invalidate |
| Delete task | `useMutation` | **Yes** | Optimistic remove + invalidate |
| Toggle complete | Uses `useUpdateTask` | **Yes** | Same as update |
| Bulk complete | `useMutation` | **Yes** | Optimistic update + invalidate |
| Bulk delete | `useMutation` | **Yes** | Optimistic remove + invalidate |

---

## 8. Zustand Store Strategy

### What Goes Where

| Data | Where It Lives | Why |
|---|---|---|
| Task list (the actual task objects) | **React Query cache** | It's "server" data. React Query handles caching, refetching, loading/error states. |
| Auth session (user + token) | **Zustand `authStore`** | It's global app state needed everywhere (header, protected routes, API calls). |
| Search keyword | **Zustand `taskFilterStore`** | It's UI state. Not server data. Needs to persist across component re-renders. |
| Filter status (all/active/completed) | **Zustand `taskFilterStore`** | Same as above. |
| Selected task IDs (for bulk actions) | **Zustand `taskSelectionStore`** | UI state for multi-select. Not persisted. |

### Auth Store — `src/features/auth/store/authStore.ts`

```typescript
interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;

  // Actions
  initialize: () => void;       // Read session from localStorage on app start
  setSession: (session: AuthSession) => void;  // After login
  logout: () => void;            // Clear everything
}

// Implementation notes:
// - initialize(): called once in App.tsx on mount, reads from localStorage
// - setSession(): saves to both Zustand state and localStorage
// - logout(): removes from both Zustand state and localStorage, clears queryClient
// - isAuthenticated: derived from whether session is not null
```

### Task Filter Store — `src/features/tasks/store/taskFilterStore.ts`

```typescript
interface TaskFilterState {
  searchKeyword: string;
  filterStatus: TaskFilterStatus;  // 'all' | 'active' | 'completed'

  // Actions
  setSearchKeyword: (keyword: string) => void;
  setFilterStatus: (status: TaskFilterStatus) => void;
  resetFilters: () => void;
}

// Default values:
// searchKeyword: ''
// filterStatus: 'all'
```

### Task Selection Store — `src/features/tasks/store/taskSelectionStore.ts`

```typescript
interface TaskSelectionState {
  selectedIds: Set<string>;  // Use Set for O(1) lookup

  // Actions
  toggleSelect: (id: string) => void;      // Add or remove single ID
  selectAll: (ids: string[]) => void;       // Select all visible task IDs
  deselectAll: () => void;                  // Clear all selections
  isSelected: (id: string) => boolean;      // Check if a specific task is selected
}

// NOTE: When using Set in Zustand, you need to create a new Set on each
// update to trigger re-renders. Example:
// toggleSelect: (id) => set((state) => {
//   const next = new Set(state.selectedIds);
//   if (next.has(id)) next.delete(id);
//   else next.add(id);
//   return { selectedIds: next };
// })
//
// ALTERNATIVE: Use string[] instead of Set<string> if Set causes issues.
// For a small number of tasks, array performance is fine.
```

### How Filtering Works (Component Logic)

The **DashboardPage** or **TaskList** component combines React Query data with Zustand filter state:

```typescript
// In DashboardPage.tsx

const { data: tasks = [], isLoading, isError } = useTasks();
const { searchKeyword, filterStatus } = useTaskFilterStore();

// Apply filters to React Query data
const filteredTasks = useMemo(() => {
  let result = tasks;

  // 1. Filter by status
  if (filterStatus === 'active') {
    result = result.filter((task) => !task.completed);
  } else if (filterStatus === 'completed') {
    result = result.filter((task) => task.completed);
  }

  // 2. Filter by search keyword
  if (searchKeyword.trim()) {
    const keyword = searchKeyword.toLowerCase();
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword)
    );
  }

  return result;
}, [tasks, filterStatus, searchKeyword]);
```

**Key Insight:** Filtering happens on the CLIENT SIDE by combining React Query data (the full task list) with Zustand state (the active filters). We do NOT re-fetch from the "server" when filters change. This is efficient and keeps the mock API simple.

---

## 9. Form Strategy

### Library Setup

- **React Hook Form**: Manages form state, submission, errors
- **Zod**: Defines validation schemas
- **@hookform/resolvers**: Connects Zod to React Hook Form

Install: `npm install react-hook-form zod @hookform/resolvers`

### Login Form Schema

```typescript
// In src/features/auth/components/LoginForm.tsx (or a separate schema file)

import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

### Login Form Component Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setServerError(null);
      const response = await authService.login(values);
      authStore.setSession(response.data);
      navigate('/');
    } catch (error) {
      setServerError(error.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {serverError && <div className="error-banner">{serverError}</div>}

      <input {...form.register('email')} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}

      <input type="password" {...form.register('password')} />
      {form.formState.errors.password && <span>{form.formState.errors.password.message}</span>}

      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
```

### Task Form Schema

```typescript
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal('')),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
```

### Task Form Component Pattern

```typescript
// TaskForm is used for BOTH creating and editing tasks.
// If `task` prop is provided, it's in edit mode. Otherwise, create mode.

interface TaskFormProps {
  task?: Task;           // If provided, we're editing this task
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function TaskForm({ task, onSubmit, onCancel, isSubmitting }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('title')} placeholder="Task title" />
      {form.formState.errors.title && <span>{form.formState.errors.title.message}</span>}

      <textarea {...form.register('description')} placeholder="Description (optional)" />
      {form.formState.errors.description && <span>{form.formState.errors.description.message}</span>}

      <div>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}
```

---

## 10. Component Breakdown

### Component Type Legend

- **Page** = Full page component. Composes other components. Connected to hooks/stores.
- **Container** = "Smart" component. Accesses stores, hooks, handles logic. Passes data to presentational components.
- **Presentational** = "Dumb" component. Receives props. Renders UI. No direct store/hook access.

### Complete Component List

| Component | Type | File Path | Responsibility |
|---|---|---|---|
| `App` | Page | `src/app/App.tsx` | Root: providers, router, auth initialization |
| `LoginPage` | Page | `src/features/auth/pages/LoginPage.tsx` | Full login page layout, redirects if already authenticated |
| `LoginForm` | Container | `src/features/auth/components/LoginForm.tsx` | Login form with RHF+Zod, calls authService, handles errors |
| `DashboardPage` | Page | `src/features/tasks/pages/DashboardPage.tsx` | Main page: fetches tasks, applies filters, renders task list |
| `ProtectedRoute` | Container | `src/layouts/ProtectedRoute.tsx` | Checks authStore, redirects to /login if unauthenticated |
| `AppLayout` | Presentational | `src/layouts/AppLayout.tsx` | Header + main content area wrapper |
| `TaskToolbar` | Container | `src/features/tasks/components/TaskToolbar.tsx` | Composes search input + filter tabs + "new task" button |
| `TaskSearchInput` | Container | `src/features/tasks/components/TaskSearchInput.tsx` | Input that writes to taskFilterStore.searchKeyword |
| `TaskFilterTabs` | Container | `src/features/tasks/components/TaskFilterTabs.tsx` | Tab buttons that write to taskFilterStore.filterStatus |
| `TaskList` | Presentational | `src/features/tasks/components/TaskList.tsx` | Maps over task array, renders TaskItem for each |
| `TaskItem` | Presentational | `src/features/tasks/components/TaskItem.tsx` | Single task row: checkbox, title, description, action buttons |
| `TaskForm` | Presentational | `src/features/tasks/components/TaskForm.tsx` | Create/edit form with RHF+Zod. Receives onSubmit prop. |
| `TaskFormModal` | Container | `src/features/tasks/components/TaskFormModal.tsx` | Modal wrapper. Manages open/close state. Calls mutation hooks. |
| `BulkActionBar` | Container | `src/features/tasks/components/BulkActionBar.tsx` | Shows when selectedIds.size > 0. Buttons for bulk complete/delete. |
| `TaskLoadingSkeleton` | Presentational | `src/features/tasks/components/TaskLoadingSkeleton.tsx` | Animated placeholder rows (3-5 rows) |
| `Button` | Presentational | `src/components/ui/Button.tsx` | Reusable button with variants (primary, secondary, danger, ghost) |
| `Input` | Presentational | `src/components/ui/Input.tsx` | Styled input with label and error message support |
| `Modal` | Presentational | `src/components/ui/Modal.tsx` | Generic modal overlay with backdrop click to close |
| `Spinner` | Presentational | `src/components/ui/Spinner.tsx` | Small loading spinner animation |
| `EmptyState` | Presentational | `src/components/ui/EmptyState.tsx` | Empty state with icon, title, description, optional CTA button |
| `ErrorAlert` | Presentational | `src/components/ui/ErrorAlert.tsx` | Error message box with retry button |

### Component Hierarchy (How They Nest)

```
App
├── QueryClientProvider
├── Toaster (react-hot-toast)
└── BrowserRouter
    ├── /login → LoginPage
    │              └── LoginForm
    │
    └── / → ProtectedRoute
              └── AppLayout
                    ├── Header (user email + logout button)
                    └── DashboardPage
                          ├── TaskToolbar
                          │     ├── TaskSearchInput
                          │     ├── TaskFilterTabs
                          │     └── "New Task" Button
                          ├── BulkActionBar (conditional)
                          ├── TaskLoadingSkeleton (when loading)
                          ├── ErrorAlert (when error)
                          ├── EmptyState (when no tasks)
                          └── TaskList
                                └── TaskItem (× n)
                          └── TaskFormModal (when open)
                                └── TaskForm
```

---

## 11. Implementation Steps

### Phase 1: Project Setup (30 minutes)

**Goal:** Get a working Vite + React + TypeScript + Tailwind project running.

**Steps:**

1. Create project:
   ```bash
   npm create vite@latest taskmaster -- --template react-ts
   cd taskmaster
   ```

2. Install dependencies:
   ```bash
   npm install
   npm install @tanstack/react-query zustand axios react-hook-form zod @hookform/resolvers react-router-dom react-hot-toast
   # Optional: npm install lucide-react (for icons)
   ```

3. Install Tailwind CSS (follow Vite + Tailwind docs):
   ```bash
   npm install -D tailwindcss @tailwindcss/vite
   ```
   Add `@import "tailwindcss";` to `src/index.css`.
   Add the Tailwind vite plugin to `vite.config.ts`.

4. Create the folder structure (all the folders from Section 3). Create empty files as placeholders.

5. Create `src/types/index.ts` with all TypeScript types from Section 4.

6. Create `src/utils/storage.ts` with the storage helper.

7. Create `src/utils/delay.ts`:
   ```typescript
   export const delay = (ms: number = 800) =>
     new Promise((resolve) => setTimeout(resolve, ms));
   ```

8. Verify the dev server runs: `npm run dev`

**Files created in this phase:**
- All folders
- `src/types/index.ts`
- `src/utils/storage.ts`
- `src/utils/delay.ts`
- `src/utils/seedData.ts`
- Updated `src/index.css`
- Updated `vite.config.ts`

---

### Phase 2: Routing + Layouts (20 minutes)

**Goal:** Set up React Router with login and dashboard routes.

1. Create `src/app/routes.tsx`:
   - Define two routes: `/login` → `LoginPage`, `/` → `ProtectedRoute` → `DashboardPage`
   - Use `BrowserRouter`, `Routes`, `Route`

2. Create `src/layouts/AppLayout.tsx`:
   - Simple layout with header bar and main content area
   - Header shows app name on the left, user email + logout button on the right
   - Renders `<Outlet />` for child routes

3. Create `src/layouts/ProtectedRoute.tsx`:
   - Placeholder for now (always renders children)
   - Will be connected to auth store in Phase 3

4. Create placeholder pages:
   - `src/features/auth/pages/LoginPage.tsx` — renders "Login Page" text
   - `src/features/tasks/pages/DashboardPage.tsx` — renders "Dashboard" text

5. Update `src/app/App.tsx`:
   - Import and render the router

6. Verify: Navigation between `/login` and `/` works in the browser.

**Files created/edited:**
- `src/app/App.tsx`
- `src/app/routes.tsx`
- `src/layouts/AppLayout.tsx`
- `src/layouts/ProtectedRoute.tsx`
- `src/features/auth/pages/LoginPage.tsx` (placeholder)
- `src/features/tasks/pages/DashboardPage.tsx` (placeholder)

---

### Phase 3: Auth System (45 minutes)

**Goal:** Working login, session persistence, protected routes, logout.

1. Create `src/services/authService.ts`:
   - Implement `login()`, `logout()`, `getSession()` as described in Section 6
   - Use `delay()` for simulated latency
   - Hardcoded credentials: `demo@taskmaster.local` / `password123`

2. Create `src/features/auth/store/authStore.ts`:
   - Implement Zustand store as described in Section 8
   - `initialize()` reads from localStorage
   - `setSession()` saves to state + localStorage
   - `logout()` clears state + localStorage

3. Update `src/app/App.tsx`:
   - Call `authStore.initialize()` on mount (inside `useEffect`)

4. Update `src/layouts/ProtectedRoute.tsx`:
   - Read `isAuthenticated` from `authStore`
   - If not authenticated, `<Navigate to="/login" />`

5. Create `src/features/auth/components/LoginForm.tsx`:
   - Implement with React Hook Form + Zod (loginSchema)
   - On submit: call `authService.login()`, then `authStore.setSession()`, then `navigate('/')`
   - Handle and display server errors
   - Show loading state on submit button

6. Update `src/features/auth/pages/LoginPage.tsx`:
   - Full login page layout
   - If already authenticated, redirect to `/`
   - Render `LoginForm`
   - Show demo credentials as a hint

7. Update `src/layouts/AppLayout.tsx`:
   - Header shows `authStore.session.user.email`
   - Logout button calls `authStore.logout()` then `navigate('/login')`

8. Create `src/lib/axios.ts`:
   - Set up Axios instance with interceptors as described in Section 6

9. **TEST:** Login with correct credentials → lands on dashboard. Refresh → still logged in. Logout → redirected to login. Login with wrong credentials → shows error.

**Files created/edited:**
- `src/services/authService.ts`
- `src/features/auth/store/authStore.ts`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/pages/LoginPage.tsx`
- `src/layouts/ProtectedRoute.tsx` (updated)
- `src/layouts/AppLayout.tsx` (updated)
- `src/lib/axios.ts`
- `src/app/App.tsx` (updated)

---

### Phase 4: Task Mock API + React Query (45 minutes)

**Goal:** Task CRUD through a mock service layer, cached with React Query.

1. Create `src/services/taskService.ts`:
   ```typescript
   // All functions follow this pattern:
   // 1. Check auth token exists in localStorage (simulate auth check)
   // 2. await delay(800) to simulate latency
   // 3. Read/write tasks from/to localStorage
   // 4. Return ApiResponse or throw ApiError

   getTasks(): Promise<Task[]>
   // - If no tasks in localStorage, seed with SEED_TASKS first
   // - Return all tasks sorted by createdAt descending (newest first)

   getTaskById(id: string): Promise<Task>
   // - Find task by id, throw 404 if not found

   createTask(input: CreateTaskInput): Promise<Task>
   // - Generate new id with crypto.randomUUID()
   // - Set completed: false, createdAt/updatedAt to now
   // - Add to tasks array in localStorage
   // - Return created task

   updateTask(id: string, input: UpdateTaskInput): Promise<Task>
   // - Find task, throw 404 if not found
   // - Merge input into task, update updatedAt
   // - Save to localStorage
   // - Return updated task

   deleteTask(id: string): Promise<void>
   // - Filter out task by id
   // - Save remaining tasks to localStorage

   bulkComplete(ids: string[]): Promise<Task[]>
   // - Set completed=true for all matching tasks
   // - Save to localStorage
   // - Return updated tasks

   bulkDelete(ids: string[]): Promise<void>
   // - Filter out all matching tasks
   // - Save remaining to localStorage
   ```

   **IMPORTANT:** Every function should:
   - Call `delay(800)` to simulate network latency
   - Check that an auth session exists in localStorage (simulate token check)
   - If no auth session, throw `{ message: 'Unauthorized', status: 401 }`

2. Create `src/lib/queryClient.ts`:
   - Configure QueryClient as described in Section 7

3. Update `src/app/App.tsx`:
   - Wrap app in `<QueryClientProvider client={queryClient}>`

4. Create React Query hooks:
   - `src/features/tasks/hooks/useTasks.ts`
   - `src/features/tasks/hooks/useCreateTask.ts`
   - `src/features/tasks/hooks/useUpdateTask.ts`
   - `src/features/tasks/hooks/useDeleteTask.ts`
   - `src/features/tasks/hooks/useBulkActions.ts`
   - All as described in Section 7

5. **TEST:** Verify in console that `useTasks()` returns seed data after login.

**Files created/edited:**
- `src/services/taskService.ts`
- `src/lib/queryClient.ts`
- `src/features/tasks/hooks/useTasks.ts`
- `src/features/tasks/hooks/useCreateTask.ts`
- `src/features/tasks/hooks/useUpdateTask.ts`
- `src/features/tasks/hooks/useDeleteTask.ts`
- `src/features/tasks/hooks/useBulkActions.ts`
- `src/app/App.tsx` (updated)

---

### Phase 5: Task List UI (45 minutes)

**Goal:** Display tasks with loading, error, and empty states.

1. Create shared UI components:
   - `src/components/ui/Button.tsx` — Reusable button with `variant` prop (primary, secondary, danger, ghost). Use Tailwind classes. Accept `isLoading` prop to show spinner.
   - `src/components/ui/Spinner.tsx` — Simple `animate-spin` SVG spinner
   - `src/components/ui/EmptyState.tsx` — Icon + title + description + optional action button
   - `src/components/ui/ErrorAlert.tsx` — Red-tinted box with error message + "Try Again" button
   - `src/components/ui/Modal.tsx` — Overlay + centered card. Close on backdrop click. Close on Escape key.
   - `src/components/ui/Input.tsx` — Styled input with label, error message, and forwarded ref

2. Create task components:
   - `src/features/tasks/components/TaskLoadingSkeleton.tsx`:
     - 4 rows of `animate-pulse` placeholder boxes
     - Each row mimics the shape of a TaskItem

   - `src/features/tasks/components/TaskItem.tsx`:
     - Props: `task: Task`, `onToggleComplete`, `onEdit`, `onDelete`, `isSelected`, `onToggleSelect`
     - Renders: checkbox (round), title, description, date, edit button, delete button
     - Completed tasks: `line-through text-gray-400` on title
     - Checkbox for multi-select (left side)

   - `src/features/tasks/components/TaskList.tsx`:
     - Props: `tasks: Task[]`
     - Maps over tasks, renders TaskItem for each
     - Passes callbacks down for toggle, edit, delete, select

3. Update `src/features/tasks/pages/DashboardPage.tsx`:
   - Use `useTasks()` hook
   - Render loading/error/empty/list states conditionally
   - For now, just display the task list without filtering

4. **TEST:** Dashboard shows seed tasks. Loading skeleton appears briefly. If you clear localStorage, empty state appears.

**Files created/edited:**
- `src/components/ui/Button.tsx`
- `src/components/ui/Spinner.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/ErrorAlert.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Input.tsx`
- `src/features/tasks/components/TaskLoadingSkeleton.tsx`
- `src/features/tasks/components/TaskItem.tsx`
- `src/features/tasks/components/TaskList.tsx`
- `src/features/tasks/pages/DashboardPage.tsx` (updated)

---

### Phase 6: Task Create & Edit (30 minutes)

**Goal:** Create and edit tasks through a modal form.

1. Create `src/features/tasks/components/TaskForm.tsx`:
   - React Hook Form + Zod (taskSchema)
   - Fields: title (input), description (textarea)
   - Props: `task?`, `onSubmit`, `onCancel`, `isSubmitting`
   - If `task` is provided, pre-fill the form (edit mode)

2. Create `src/features/tasks/components/TaskFormModal.tsx`:
   - Manages modal open/close state
   - When creating: opens empty form, calls `useCreateTask().mutate()` on submit
   - When editing: opens pre-filled form, calls `useUpdateTask().mutate()` on submit
   - Closes modal on success

3. Update `DashboardPage.tsx`:
   - Add state for `isFormOpen` and `editingTask`
   - "New Task" button opens modal in create mode
   - Edit button on TaskItem opens modal in edit mode
   - Wire up the TaskFormModal

4. Wire up delete:
   - Delete button on TaskItem calls `useDeleteTask().mutate(task.id)`
   - Add a confirmation step (simple `window.confirm()` is fine for 1-day scope)

5. Wire up toggle complete:
   - Clicking the checkbox calls `useUpdateTask().mutate({ id, data: { completed: !task.completed } })`

6. Install toast: ensure `react-hot-toast` `<Toaster />` is in `App.tsx`

7. **TEST:** Create a task → appears in list. Edit a task → changes reflected. Delete a task → removed from list. Toggle complete → visual change with line-through. Toast messages appear.

**Files created/edited:**
- `src/features/tasks/components/TaskForm.tsx`
- `src/features/tasks/components/TaskFormModal.tsx`
- `src/features/tasks/pages/DashboardPage.tsx` (updated)

---

### Phase 7: Search & Filter (20 minutes)

**Goal:** Global search and status filtering.

1. Create `src/features/tasks/store/taskFilterStore.ts`:
   - Zustand store as described in Section 8

2. Create `src/features/tasks/components/TaskSearchInput.tsx`:
   - Controlled input that writes to `taskFilterStore.setSearchKeyword`
   - Has a search icon (magnifying glass) and a clear button (X) when text exists
   - Optional: debounce input by 300ms for smoother UX (use a simple setTimeout/clearTimeout pattern)

3. Create `src/features/tasks/components/TaskFilterTabs.tsx`:
   - Three tabs: "All", "Active", "Completed"
   - Reads and writes `taskFilterStore.filterStatus`
   - Show task count per tab if possible (e.g., "All (6)", "Active (4)", "Completed (2)")

4. Create `src/features/tasks/components/TaskToolbar.tsx`:
   - Composes `TaskSearchInput`, `TaskFilterTabs`, and "New Task" button in a flex row
   - On mobile, stack vertically

5. Update `DashboardPage.tsx`:
   - Import `useTaskFilterStore`
   - Apply filtering logic with `useMemo` as described in Section 8
   - Pass `filteredTasks` to `TaskList`
   - Show empty state that says "No matching tasks" (different from "No tasks yet") when filter produces empty results

6. **TEST:** Search filters tasks in real time. Filter tabs work. Search + filter work together. Clearing search shows all tasks for the active filter.

**Files created/edited:**
- `src/features/tasks/store/taskFilterStore.ts`
- `src/features/tasks/components/TaskSearchInput.tsx`
- `src/features/tasks/components/TaskFilterTabs.tsx`
- `src/features/tasks/components/TaskToolbar.tsx`
- `src/features/tasks/pages/DashboardPage.tsx` (updated)

---

### Phase 8: Bulk Actions (25 minutes)

**Goal:** Multi-select tasks and perform bulk operations.

1. Create `src/features/tasks/store/taskSelectionStore.ts`:
   - Zustand store as described in Section 8

2. Update `TaskItem.tsx`:
   - Add a selection checkbox (separate from the complete toggle checkbox)
   - Read `isSelected` from props
   - Call `onToggleSelect(task.id)` when selection checkbox clicked

3. Create `src/features/tasks/components/BulkActionBar.tsx`:
   - Only renders when `selectedIds.size > 0`
   - Shows: "{n} selected" text
   - Buttons: "Complete Selected", "Delete Selected", "Clear Selection"
   - "Complete Selected" calls `useBulkComplete().mutate(selectedIds)`
   - "Delete Selected" calls `useBulkDelete().mutate(selectedIds)` with confirmation
   - After bulk action succeeds, call `deselectAll()`
   - Add a "Select All" checkbox in the toolbar or list header that selects all VISIBLE (filtered) tasks

4. Update `DashboardPage.tsx`:
   - Wire up TaskSelectionStore
   - Pass selection state + handlers to TaskList/TaskItem
   - Render BulkActionBar
   - When filters change, clear selection (call `deselectAll()`)

5. **TEST:** Check individual tasks → bar appears. Select all → all visible selected. Bulk complete → all marked done. Bulk delete → all removed. Clear selection → bar disappears.

**Files created/edited:**
- `src/features/tasks/store/taskSelectionStore.ts`
- `src/features/tasks/components/BulkActionBar.tsx`
- `src/features/tasks/components/TaskItem.tsx` (updated)
- `src/features/tasks/pages/DashboardPage.tsx` (updated)

---

### Phase 9: UI Polish (30 minutes)

**Goal:** Make everything look professional and handle edge cases.

1. **Responsive design pass:**
   - Test on mobile viewport (375px width)
   - Ensure toolbar stacks on mobile
   - Task items are readable on mobile
   - Modal is full-screen on mobile, centered on desktop

2. **Transition animations:**
   - Add `transition-all duration-200` to buttons, cards, tabs
   - Modal fade-in: use `animate-in` or a simple opacity transition

3. **Keyboard accessibility:**
   - Forms are navigable with Tab
   - Buttons are focusable
   - Modal closes on Escape
   - Enter submits forms

4. **Edge cases:**
   - Very long task titles: truncate with `truncate` or `line-clamp-1` class
   - Empty description: don't show description line at all
   - Many tasks: ensure the list scrolls properly
   - Logout clears React Query cache: `queryClient.clear()`

5. **Visual consistency check:**
   - All buttons use the `Button` component
   - All inputs use the `Input` component
   - Consistent spacing (`gap-4`, `p-4`, `mb-4`)
   - Consistent border radius (`rounded-lg`)

6. **Add task count in toolbar:**
   - Show "6 tasks" or "Showing 3 of 6 tasks" when filter is active

**Files edited:** Multiple component files for styling tweaks.

---

### Phase 10: README + Final Review (20 minutes)

**Goal:** Write a professional README and do a final check.

1. Write `README.md` (see Section 13 for outline)
2. Final walkthrough:
   - Fresh browser (clear localStorage)
   - Login with demo credentials
   - Verify seed data appears
   - Create, edit, delete, toggle tasks
   - Search and filter
   - Bulk select and actions
   - Logout and login again
   - Check console for errors
   - Check mobile responsive layout
3. Optional: Deploy to Vercel/Netlify (5 minutes with Vite)
   - `npm run build`
   - Deploy `dist/` folder

---

### Phase 11: Optional Deploy (10 minutes)

If time permits:
1. Push code to GitHub
2. Connect to Vercel: `npx vercel` or through Vercel dashboard
3. Add deployment link to README

---

### Time Budget Summary

| Phase | Task | Time |
|---|---|---|
| 1 | Project Setup | 30 min |
| 2 | Routing + Layouts | 20 min |
| 3 | Auth System | 45 min |
| 4 | Task Mock API + React Query | 45 min |
| 5 | Task List UI | 45 min |
| 6 | Task Create & Edit | 30 min |
| 7 | Search & Filter | 20 min |
| 8 | Bulk Actions | 25 min |
| 9 | UI Polish | 30 min |
| 10 | README + Final Review | 20 min |
| 11 | Deploy (optional) | 10 min |
| **TOTAL** | | **~5.5 hours** |

This leaves buffer time for debugging and unexpected issues within an 8-hour workday.

---

## 12. Acceptance Criteria

### Must Pass Before Submission

#### Functional Checks

- [x] Login with `demo@taskmaster.local` / `password123` succeeds and redirects to dashboard
- [x] Login with wrong credentials shows error message
- [x] Page refresh does NOT log the user out (session persisted)
- [x] Visiting `/` without login redirects to `/login`
- [x] Logout clears session and redirects to `/login`
- [x] Dashboard shows seed tasks on first visit
- [x] Creating a task adds it to the list
- [x] Editing a task updates its title/description
- [x] Deleting a task removes it from the list
- [x] Toggling complete changes the task's visual state (line-through)
- [x] Search filters tasks by title and description
- [x] Filter tabs (All/Active/Completed) filter correctly
- [x] Search + filter work together (e.g., search "review" in "Completed" tab)
- [x] Loading skeleton shows while tasks are loading
- [x] Empty state shows when no tasks match
- [x] Error state shows when fetch fails (can test by temporarily breaking the service)
- [x] Toast notifications appear on success and error

#### Bulk Action Checks (if implemented)

- [x] Clicking checkbox selects a task
- [x] Bulk action bar appears when tasks are selected
- [x] "Select All" selects all visible (filtered) tasks
- [x] Bulk complete marks all selected tasks as completed
- [x] Bulk delete removes all selected tasks
- [x] Changing filter clears selection
- [x] Bulk action bar disappears when selection is cleared

#### Technical Checks

- [x] No TypeScript errors (`npm run build` succeeds)
- [x] No console errors in browser
- [x] LocalStorage is ONLY accessed in `services/` and `utils/storage.ts` — never in components
- [x] React Query manages all task data fetching
- [x] Zustand manages UI state only (search, filter, selection, auth)
- [x] Optimistic updates work for toggle complete and delete
- [x] Form validation works (empty title blocked, email format enforced)
- [x] Axios interceptors are configured

#### UX Checks

- [x] App looks clean and consistent (not "vibe-coded")
- [x] Responsive on mobile (test at 375px width)
- [x] Buttons show hover/focus states
- [x] Forms show inline validation errors
- [x] Loading and error states look professional
- [x] Completed tasks are visually distinct (line-through + muted color)

#### Documentation Checks

- [x] README.md exists and is well-structured
- [x] Demo credentials are documented
- [x] "How to run locally" instructions work
- [x] Architectural decisions are explained

---

## 13. README Plan

```markdown
# TaskMaster

A modern, offline-first task management application built as a frontend technical assessment.

## Overview

TaskMaster is a single-page application that demonstrates clean React architecture,
professional async state management, and thoughtful UI/UX — all running entirely in the browser
with no backend server.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework + build tool |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Zustand | Global UI state (auth, filters, selection) |
| TanStack React Query | Server-state management (task CRUD, caching) |
| Axios | HTTP client with interceptors |
| React Hook Form + Zod | Form management and validation |
| React Router | Client-side routing |
| react-hot-toast | Toast notifications |

## Features

- Mock authentication with session persistence
- Full task CRUD (create, read, update, delete)
- Optimistic updates for instant UI feedback
- Global search across task titles and descriptions
- Status filtering (All / Active / Completed)
- Multi-select with bulk complete and delete
- Loading skeletons, error states, and empty states
- Responsive design (mobile + desktop)
- Mock API layer with simulated latency

## Demo Credentials

| Field | Value |
|---|---|
| Email | demo@taskmaster.local |
| Password | password123 |

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
(bash commands for clone, install, dev)

### Build
(bash commands for build)

## Project Structure

(folder tree with explanations)

## Architecture Decisions

### Why Zustand + React Query (not just one or the other)?

React Query is designed for "server state" — data that comes from an external source and needs
caching, loading states, error handling, and synchronization. Even though our "server" is
localStorage, React Query gives us all this for free.

Zustand handles "client state" — UI state like search keywords, active filters, and selected items
that don't need caching or refetching.

Using both keeps responsibilities clean and avoids putting everything into one massive store.

### Why a Mock API Layer?

All localStorage access is encapsulated in service functions that return Promises with simulated
latency. This means:
- Components are decoupled from the data source
- Switching to a real API would only require changing the service files
- We can simulate realistic loading and error states

### Why Optimistic Updates?

For toggle complete and delete, the UI updates immediately before the "server" confirms. If the
mutation fails, it rolls back. This gives the app a snappy, responsive feel.

## Mock API Details

(explanation of how services work, latency simulation, auth checking)

## Known Limitations

- Single user only (no registration)
- Data stored in localStorage (clears when browser data is cleared)
- No real network requests (mock API layer)
- No drag-and-drop reordering
- No dark mode

## Future Improvements

- Real backend API integration
- User registration and JWT authentication
- Task categories/tags
- Due dates with calendar picker
- Drag-and-drop task reordering
- Dark mode support
- Unit and integration tests

## Deployment

(Vercel/Netlify link placeholder)
```

---

## 14. Extra Point Suggestions

These are features that show polish and attention to detail WITHOUT adding significant scope:

| Extra Point | Effort | Impact | Notes |
|---|---|---|---|
| **Optimistic updates** | Medium | High | Already in the plan. Shows advanced React Query knowledge. |
| **Loading skeletons** | Low | High | Much better than a spinner. Shows UI care. |
| **Toast feedback** | Low | High | `react-hot-toast` is 5 min to set up. Huge UX improvement. |
| **Seed data** | Low | High | Evaluator sees a populated app immediately. No awkward empty start. |
| **Thoughtful empty state** | Low | Medium | A nice illustration or icon + helpful message. |
| **Bulk actions** | Medium | High | Shows you can handle complex UI state. |
| **Professional README** | Low | Very High | This is often the FIRST thing evaluators read. Make it great. |
| **Responsive mobile layout** | Low | Medium | Just test and tweak Tailwind breakpoints. |
| **Keyboard accessible forms** | Low | Medium | Tab navigation, Enter to submit, Escape to close modal. |
| **Task count in toolbar** | Very Low | Low | "Showing 3 of 6 tasks" — small but thoughtful. |
| **Confirm before delete** | Very Low | Low | Simple `window.confirm()`. Prevents accidents. |
| **Clear filters shortcut** | Very Low | Low | "Clear all filters" link when filters are active. |

### Do NOT Add These (Too Much Scope)

- Dark mode toggle
- Drag and drop
- Animations library (Framer Motion)
- Unit tests (if time is tight — better to have working features + good README)
- Real-time collaboration
- Undo/redo
- Sub-tasks
- Tags / categories
- Due dates / calendar

---

## 15. Risk Management

### If Running Behind Schedule

| Time Remaining | What to Cut | What to Keep |
|---|---|---|
| 3+ hours left | On track. Build everything. | All features. |
| 2 hours left | Cut bulk actions. Simplify UI polish. | Core CRUD, search, filter, auth, README. |
| 1 hour left | Cut bulk actions AND optimistic updates. Use simple `invalidateQueries` for all mutations. Cut fancy empty states. | Core CRUD, search, filter, auth, basic README. |
| 30 min left | STOP building features. Focus only on README + making sure app doesn't crash. | Whatever is working. Write the README NOW. |

### Priority Order (Most Important First)

1. **Auth + Protected Routes** (without this, the app fails basic requirements)
2. **Task List + Fetch** (core functionality)
3. **Create Task** (CRUD requirement)
4. **Edit Task** (CRUD requirement)
5. **Delete Task** (CRUD requirement)
6. **Toggle Complete** (core UX)
7. **Search** (required feature)
8. **Filter** (required feature)
9. **README** (evaluators read this first!)
10. **Toast notifications** (easy win for UX)
11. **Loading skeletons** (easy win for UX)
12. **Optimistic updates** (shows advanced knowledge)
13. **Bulk actions** (extra credit)
14. **Responsive polish** (nice to have)
15. **Deploy** (nice to have)

### Common Pitfalls to Avoid

| Pitfall | How to Avoid |
|---|---|
| Over-engineering the mock API | Keep it simple. Promise + setTimeout + localStorage. No need for MSW or Axios Mock Adapter if a manual wrapper works. |
| Spending too long on styling | Get functionality working first with basic Tailwind. Polish at the end. |
| Getting stuck on TypeScript types | Use `as` casts sparingly if stuck. Better to have a working app with a few `any` types than a perfect type system with half the features. |
| Not testing the full flow | After each phase, do a quick manual test. Don't wait until the end. |
| Forgetting the README | Start the README skeleton early. Fill it in as you build. Don't leave it for the last 5 minutes. |
| Overcomplicating Zustand stores | Keep stores flat and simple. Avoid derived state in stores — compute it in components with `useMemo`. |
| Putting business logic in components | Components should call hooks. Hooks should call services. Services should access storage. Keep the layers clean. |

---

## 16. Enhancement Pass

### Post-Plan Improvements Added

- **Axios-backed mock transport:** The mock API now runs through a shared Axios client with request interceptors and a manual adapter-backed mock server, instead of calling storage wrappers directly from service methods.
- **Reviewer scenario lab:** The dashboard includes a dedicated panel to simulate the next fetch failure or mutation failure without changing code, making loading/error/rollback behavior easy for evaluators to verify.
- **Bold productized UI pass:** The login and dashboard surfaces were upgraded with stronger hierarchy, more deliberate visual direction, and reviewer-friendly presentation while keeping the original scope intact.

### Why These Enhancements Matter

- They align more directly with the take-home brief's emphasis on abstraction, async data flow, and visible UI polish.
- They make advanced behaviors easier to demonstrate during manual review.
- They improve the first impression of the submission without expanding into out-of-scope features.

---

## Appendix: Quick Reference for Key Patterns

### Pattern 1: Service Function Template

```typescript
export async function getTasks(): Promise<Task[]> {
  // 1. Check auth
  const session = storage.get<AuthSession>(STORAGE_KEYS.AUTH_SESSION);
  if (!session) {
    throw { message: 'Unauthorized', status: 401 };
  }

  // 2. Simulate latency
  await delay(800);

  // 3. Read from localStorage
  let tasks = storage.get<Task[]>(STORAGE_KEYS.TASKS);

  // 4. Seed if empty
  if (!tasks) {
    tasks = SEED_TASKS;
    storage.set(STORAGE_KEYS.TASKS, tasks);
  }

  // 5. Return data
  return tasks;
}
```

### Pattern 2: React Query Mutation with Optimistic Update Template

```typescript
export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      taskService.updateTask(id, { completed }),

    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list() });
      const previous = queryClient.getQueryData<Task[]>(taskKeys.list());
      queryClient.setQueryData<Task[]>(taskKeys.list(), (old) =>
        old?.map((t) => (t.id === id ? { ...t, completed } : t)) ?? []
      );
      return { previous };
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.list(), context.previous);
      }
      toast.error('Failed to update task');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.list() });
    },
  });
}
```

### Pattern 3: Zustand Store Template

```typescript
import { create } from 'zustand';

interface ExampleState {
  value: string;
  setValue: (v: string) => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  value: '',
  setValue: (v) => set({ value: v }),
  reset: () => set({ value: '' }),
}));
```

### Pattern 4: Protected Route Template

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

**End of Technical Plan.**

This document contains everything needed to implement TaskMaster from scratch. Follow the phases in order, test after each phase, and refer to the detailed sections when implementing specific features.
