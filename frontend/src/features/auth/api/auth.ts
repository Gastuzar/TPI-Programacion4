import { api } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../../usuarios/types'
import type { LoginPayload, RegisterPayload } from '../types'

export const authApi = {
  async login({ username, password }: LoginPayload): Promise<void> {
    const body = new URLSearchParams()
    body.set('username', username)
    body.set('password', password)
    await api.post('/auth/token', body) // el JWT queda en la cookie HttpOnly, no viene en el cuerpo
  },
  async register(payload: RegisterPayload): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/auth/register', payload)
    return data
  },
  async me(): Promise<Usuario> {
    const { data } = await api.get<Usuario>('/auth/me')
    return data
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
