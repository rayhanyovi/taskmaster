import { describe, it, expect } from 'vitest'
import { findDemoAccount, demoAccounts } from './demoCredentials'

describe('findDemoAccount', () => {
  it('returns the matching account for valid credentials', () => {
    const first = demoAccounts[0]
    const result = findDemoAccount({ email: first.email, password: first.password })
    expect(result).toEqual(first)
  })

  it('matches all three demo accounts', () => {
    for (const account of demoAccounts) {
      expect(findDemoAccount({ email: account.email, password: account.password })).toBeDefined()
    }
  })

  it('returns undefined for wrong password', () => {
    const first = demoAccounts[0]
    expect(findDemoAccount({ email: first.email, password: 'wrong' })).toBeUndefined()
  })

  it('returns undefined for unknown email', () => {
    expect(findDemoAccount({ email: 'unknown@test.com', password: 'password123' })).toBeUndefined()
  })

  it('trims and lowercases the email before matching', () => {
    const first = demoAccounts[0]
    const upper = first.email.toUpperCase()
    expect(findDemoAccount({ email: `  ${upper}  `, password: first.password })).toEqual(first)
  })
})
