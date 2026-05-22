import axios from 'axios'
import { STORAGE_KEYS } from '../constants/storage'
import { storage } from '../utils/storage'
import type { AuthSession } from '../types/auth'
import { MockHttpError, type MockApiError } from './mockApi'
import { handleMockRequest } from './mockServer'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
  adapter: async (config) => {
    try {
      return await handleMockRequest(config)
    } catch (error) {
      throw new MockHttpError(error as MockApiError)
    }
  },
})

apiClient.interceptors.request.use((config) => {
  const session = storage.get<AuthSession>(STORAGE_KEYS.authSession)

  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)
