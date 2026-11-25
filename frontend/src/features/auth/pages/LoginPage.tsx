import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { primerError } from '../../../shared/utils/format'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { useAuthStore } from '../../../store/authStore'

interface LocationState {
  from?: string
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as LocationState | null)?.from ?? '/'

  const mutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => login(username, password),
    onSuccess: () => navigate(destino, { replace: true }),
  })

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value).catch(() => undefined) // el error se muestra abajo
    },
  })

  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-6">
        <h1 className="mb-4 text-xl font-bold">Ingresar</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El usuario es obligatorio') }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value ? undefined : 'La contraseña es obligatoria') }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          {mutation.isError && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-700" role="alert">
              {handleApiError(mutation.error)}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
