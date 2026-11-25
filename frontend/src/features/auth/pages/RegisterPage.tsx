import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/format'
import { useAuthStore } from '../../../store/authStore'
import { authApi } from '../api/auth'
import type { RegisterPayload } from '../types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await authApi.register(payload)
      await login(payload.username, payload.password) // queda con la sesión iniciada
    },
    onSuccess: () => navigate('/', { replace: true }),
  })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: async ({ value }) => {
      const payload: RegisterPayload = {
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      }
      await mutation.mutateAsync(payload).catch(() => undefined)
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-4 text-xl font-bold">Crear cuenta</h1>
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
            validators={{
              onChange: ({ value }) => (value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres'),
            }}
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
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio') }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (EMAIL_RE.test(value) ? undefined : 'Email inválido') }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres') }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value === fieldApi.form.getFieldValue('password') ? undefined : 'Las contraseñas no coinciden',
            }}
          >
            {(field) => (
              <Input
                label="Repetir contraseña"
                type="password"
                autoComplete="new-password"
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
            {mutation.isPending ? 'Creando cuenta…' : 'Registrarme'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}
