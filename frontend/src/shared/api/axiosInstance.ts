import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // el navegador adjunta la cookie HttpOnly, el frontend nunca ve el token
})

let onSessionExpired: (() => void) | null = null

/** El authStore registra aca cómo limpiar la sesión ante un 401 */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

interface ErrorBody {
  detail?: unknown
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ErrorBody>(error)) {
      const status = error.response?.status
      const url = error.config?.url ?? ''
      const detail = error.response?.data?.detail
      const esLoginOMe = url.includes('/auth/token') || url.includes('/auth/me')
      const cuentaDesactivada = status === 400 && detail === 'Cuenta de usuario desactivada'
      if ((status === 401 && !esLoginOMe) || cuentaDesactivada) {
        onSessionExpired?.() // ProtectedRoute redirige a /login al quedar sin usuario
      }
    }
    return Promise.reject(error)
  },
)
