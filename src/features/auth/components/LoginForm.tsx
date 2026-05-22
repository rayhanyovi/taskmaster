import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { LogIn, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Alert, AlertDescription } from '../../../components/ui/Alert'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { Label } from '../../../components/ui/Label'
import { Spinner } from '../../../components/ui/Spinner'
import { authService } from '../../../services/authService'
import { demoAccounts } from '../../../services/demoCredentials'
import { MockHttpError } from '../../../services/mockApi'
import type { LoginPayload } from '../../../types/auth'
import { useAuthStore } from '../store/authStore'

const loginSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export function LoginForm() {
  const setSession = useAuthStore((state) => state.setSession)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@taskmaster.local',
      password: 'password123',
    },
  })

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (session) => {
      setSession(session)
      toast.success('Welcome back.')
    },
  })

  const serverError = mutation.error instanceof MockHttpError ? mutation.error.message : null

  const onSubmit = (values: LoginPayload) => mutation.mutate(values)

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1">
        <Badge className="gap-2 bg-sky-50 text-sky-700 ring-transparent">
          <LogIn className="h-3.5 w-3.5" />
          Demo access
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-[#e6edf3]">TaskMaster</h1>
        <p className="text-sm leading-6 text-slate-500 dark:text-[#8b949e]">
          Manage your tasks with a focused offline workspace.
        </p>
      </div>

      {serverError ? (
        <Alert className="border-red-200 bg-red-50 px-3 py-2">
          <AlertDescription className="text-red-700">{serverError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" placeholder="demo@taskmaster.local" {...register('email')} />
        {errors.email ? <span className="text-xs text-red-500">{errors.email.message}</span> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" placeholder="password123" {...register('password')} />
        {errors.password ? (
          <span className="text-xs text-red-500">{errors.password.message}</span>
        ) : null}
      </div>

      <Button className="w-full gap-2" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner /> : null}
        <span>{mutation.isPending ? 'Signing in...' : 'Login'}</span>
      </Button>

      <Card className="bg-slate-50 text-sm text-slate-500 dark:bg-[#0d1117] dark:text-[#8b949e]">
        <CardContent className="px-4 py-3">
        <div className="font-semibold text-slate-700 dark:text-[#e6edf3]">Demo credentials</div>
        <div className="mt-3 grid gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-sky-200 hover:bg-sky-50 dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#58a6ff]/30 dark:hover:bg-[#21262d]"
              onClick={() => {
                setValue('email', account.email, { shouldValidate: true })
                setValue('password', account.password, { shouldValidate: true })
              }}
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-[#e6edf3]">
                  <UserRound className="h-3.5 w-3.5 text-slate-400 dark:text-[#6e7681]" />
                  {account.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-[#8b949e]">
                  {account.email}
                </span>
              </span>
              <span className="text-xs font-semibold text-sky-700 dark:text-[#58a6ff]">Use</span>
            </button>
          ))}
        </div>
        </CardContent>
      </Card>
    </form>
  )
}
