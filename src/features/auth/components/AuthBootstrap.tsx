import { useEffect, type PropsWithChildren } from 'react'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../store/authStore'

export function AuthBootstrap({ children }: PropsWithChildren) {
  const setSession = useAuthStore((state) => state.setSession)
  const hydrated = useAuthStore((state) => state.hydrated)
  const setHydrated = useAuthStore((state) => state.setHydrated)

  useEffect(() => {
    setSession(authService.getSession())
    setHydrated(true)
  }, [setHydrated, setSession])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm text-gray-500 shadow-sm">
          Restoring session...
        </div>
      </div>
    )
  }

  return children
}
