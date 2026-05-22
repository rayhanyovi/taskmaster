import type { LoginPayload } from '../types/auth'

export interface DemoAccount extends LoginPayload {
  label: string
  token: string
}

export const demoAccounts: DemoAccount[] = [
  {
    label: 'Product Lead',
    email: 'demo@taskmaster.local',
    password: 'password123',
    token: 'taskmaster-demo-token-product',
  },
  {
    label: 'Design Reviewer',
    email: 'designer@taskmaster.local',
    password: 'design123',
    token: 'taskmaster-demo-token-design',
  },
  {
    label: 'Engineering Owner',
    email: 'engineer@taskmaster.local',
    password: 'build123',
    token: 'taskmaster-demo-token-engineering',
  },
]

export function findDemoAccount(payload: LoginPayload) {
  const email = payload.email.toLowerCase().trim()
  return demoAccounts.find(
    (account) => account.email === email && account.password === payload.password,
  )
}
