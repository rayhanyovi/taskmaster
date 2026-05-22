import { STORAGE_KEYS } from '../constants/storage'
import type { AuthSession, LoginPayload } from '../types/auth'
import { storage } from '../utils/storage'
import { apiClient } from './http'

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<AuthSession>('/auth/login', payload)
    storage.set(STORAGE_KEYS.authSession, response.data)
    return response.data
  },

  logout() {
    storage.remove(STORAGE_KEYS.authSession)
  },

  getSession() {
    return storage.get<AuthSession>(STORAGE_KEYS.authSession)
  },
}
