import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Info, RefreshCw, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useStore } from 'zustand'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import { authService } from '../../../services/authService'
import { demoAccounts } from '../../../services/demoCredentials'
import {
  armMockFailure,
  clearMockFailures,
  mockScenarioStore,
} from '../../../services/mockScenario'
import { useAuthStore } from '../../auth/store/authStore'

interface TaskScenarioLabProps {
  onRefetch: () => void
}

export function TaskScenarioLab({ onRefetch }: TaskScenarioLabProps) {
  const nextFailure = useStore(mockScenarioStore, (state) => state.nextFailure)
  const setSession = useAuthStore((state) => state.setSession)
  const session = useAuthStore((state) => state.session)
  const queryClient = useQueryClient()
  const hasArmedScenario = nextFailure.fetch || nextFailure.mutation
  const [isOpen, setIsOpen] = useState(false)
  const switchAccount = useMutation({
    mutationFn: authService.login,
    onSuccess: async (nextSession) => {
      setSession(nextSession)
      await queryClient.invalidateQueries()
      toast.success(`Switched to ${nextSession.email}`)
      onRefetch()
    },
    onError: () => {
      toast.error('Failed to switch account.')
    },
  })

  return (
    <div className="fixed right-4 bottom-4 z-30 sm:right-6 sm:bottom-6">
      {isOpen ? (
        <Card className="animate-pop-in w-[calc(100vw-2rem)] max-w-sm border-slate-200 bg-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.55)] dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,0.8)]">
          <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-950 dark:text-[#e6edf3]">Scenario lab</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-[#8b949e]">
                Trigger one-time mock failures to verify retry, toast, and rollback behavior.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label="Minimize scenario lab"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="gap-2 px-3"
              onClick={() => {
                armMockFailure('fetch')
                onRefetch()
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Fail load
            </Button>
            <Button
              variant="secondary"
              className="gap-2 px-3"
              onClick={() => armMockFailure('mutation')}
            >
              <AlertCircle className="h-4 w-4" />
              Fail save
            </Button>
            <Button variant="ghost" onClick={clearMockFailures}>
              Reset
            </Button>
            <Button onClick={onRefetch}>Reload</Button>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-[#30363d]">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-[#6e7681]">
              Switch account
            </h3>
            <div className="mt-2 grid gap-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant={session?.email === account.email ? 'primary' : 'secondary'}
                  className="justify-start gap-2 px-3"
                  disabled={switchAccount.isPending}
                  onClick={() =>
                    switchAccount.mutate({
                      email: account.email,
                      password: account.password,
                    })
                  }
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="border border-slate-200 bg-slate-50 normal-case tracking-normal text-slate-600 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
              Load: {nextFailure.fetch ? 'armed' : 'idle'}
            </Badge>
            <Badge className="border border-slate-200 bg-slate-50 normal-case tracking-normal text-slate-600 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
              Save: {nextFailure.mutation ? 'armed' : 'idle'}
            </Badge>
            {hasArmedScenario ? (
              <Badge className="border border-amber-300 bg-amber-50 normal-case tracking-normal text-amber-800">
                One-time failure armed
              </Badge>
            ) : null}
          </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          size="icon"
          type="button"
          aria-label="Open scenario lab"
          className="h-12 w-12 rounded-full border border-sky-400 shadow-[0_18px_45px_-18px_rgba(2,132,199,0.7)]"
          onClick={() => setIsOpen(true)}
        >
          <Info className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
