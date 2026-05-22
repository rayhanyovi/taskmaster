export const storage = {
  get<T>(key: string): T | null {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) return null

    try {
      return JSON.parse(rawValue) as T
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T) {
    window.localStorage.setItem(key, JSON.stringify(value))
  },

  remove(key: string) {
    window.localStorage.removeItem(key)
  },
}
