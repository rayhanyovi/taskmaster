import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from './storage'

const KEY = 'test-key'

beforeEach(() => {
  localStorage.clear()
})

describe('storage.get', () => {
  it('returns null when key is missing', () => {
    expect(storage.get(KEY)).toBeNull()
  })

  it('parses and returns stored value', () => {
    localStorage.setItem(KEY, JSON.stringify({ a: 1 }))
    expect(storage.get(KEY)).toEqual({ a: 1 })
  })

  it('returns null for invalid JSON', () => {
    localStorage.setItem(KEY, 'not-json{{{')
    expect(storage.get(KEY)).toBeNull()
  })
})

describe('storage.set', () => {
  it('stores value as JSON string', () => {
    storage.set(KEY, { x: 42 })
    expect(localStorage.getItem(KEY)).toBe('{"x":42}')
  })

  it('overwrites existing value', () => {
    storage.set(KEY, 'first')
    storage.set(KEY, 'second')
    expect(storage.get(KEY)).toBe('second')
  })
})

describe('storage.remove', () => {
  it('removes the key', () => {
    storage.set(KEY, 'value')
    storage.remove(KEY)
    expect(storage.get(KEY)).toBeNull()
  })

  it('does not throw when key does not exist', () => {
    expect(() => storage.remove('nonexistent')).not.toThrow()
  })
})
