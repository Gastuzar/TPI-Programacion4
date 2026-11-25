import axios from 'axios'

interface ValidationIssue {
  msg?: string
  loc?: unknown[]
}

interface ErrorBody {
  detail?: string | ValidationIssue[]
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<ErrorBody>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor'
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          const campo = Array.isArray(d.loc) ? String(d.loc[d.loc.length - 1]) : ''
          return campo ? `${campo}: ${d.msg ?? 'valor inválido'}` : (d.msg ?? 'valor inválido')
        })
        .join(' · ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
