import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types'

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const sesionId = useAuthStore((s) => s.usuario?.id)

  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { header: 'Usuario', accessorKey: 'username' },
      { header: 'Nombre', accessorKey: 'full_name' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Rol', accessorKey: 'role' },
      {
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${row.original.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
          >
            {row.original.disabled ? 'Desactivado' : 'Activo'}
          </span>
        ),
      },
      {
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original
          if (u.disabled) {
            return (
              <Button size="sm" disabled={activar.isPending} onClick={() => activar.mutate(u.id)}>
                Activar
              </Button>
            )
          }
          // el botón Desactivar no se muestra en la fila del usuario de la sesión
          if (u.id === sesionId) return <span className="text-xs text-slate-400">Tu cuenta</span>
          return (
            <Button variant="danger" size="sm" disabled={desactivar.isPending} onClick={() => desactivar.mutate(u.id)}>
              Desactivar
            </Button>
          )
        },
      },
    ],
    [activar, desactivar, sesionId],
  )

  const errorMutacion = activar.error ?? desactivar.error

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      {errorMutacion && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {handleApiError(errorMutacion)}
        </p>
      )}
      {usuarios.isPending ? (
        <SkeletonRows />
      ) : usuarios.isError ? (
        <EstadoError mensaje={handleApiError(usuarios.error)} onReintentar={() => void usuarios.refetch()} />
      ) : usuarios.data.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios" />
      ) : (
        <DataTable data={usuarios.data} columns={columns} />
      )}
    </div>
  )
}
