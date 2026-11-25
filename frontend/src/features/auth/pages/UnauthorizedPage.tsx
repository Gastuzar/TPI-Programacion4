import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/Card'

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <p className="text-4xl">🚫</p>
      <h1 className="mt-2 text-xl font-bold">Sin permiso</h1>
      <p className="mt-1 text-sm text-slate-500">No tenés permisos para acceder a esta sección.</p>
      <Link to="/" className="mt-4 inline-block font-medium text-orange-600 hover:underline">
        Volver al inicio
      </Link>
    </Card>
  )
}
