import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const setSession = useAuthStore((state) => state.setSession)

  return {
    session,
    isAuthenticated: Boolean(session),
    async logout() {
      authService.logout()
      setSession(null)
      queryClient.clear()
      toast.success('Logged out successfully.')
    },
  }
}
