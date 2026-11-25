import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../features/auth/api/auth'
import type { Usuario } from '../features/usuarios/types'
import { setSessionExpiredHandler } from '../shared/api/axiosInstance'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await authApi.login({ username, password })
        const usuario = await authApi.me()
        set({ usuario })
      },
      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({ usuario: null })
        }
      },
      // Se llama una sola vez: confirma con /auth/me si la cookie sigue vigente
      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await authApi.me()
          set({ usuario })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ usuario: state.usuario }), // nunca se guarda el token
    },
  ),
)

// Ante un 401 el interceptor de Axios limpia la sesión
setSessionExpiredHandler(() => useAuthStore.setState({ usuario: null }))
