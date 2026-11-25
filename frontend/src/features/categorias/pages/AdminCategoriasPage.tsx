import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { CategoriaFormModal } from '../components/CategoriaFormModal'
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const eliminar = useEliminarCategoria()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)

  const abrirNueva = () => {
    setEditando(null)
    setModalAbierto(true)
  }
  const abrirEdicion = (categoria: Categoria) => {
    setEditando(categoria)
    setModalAbierto(true)
  }

  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Nombre', accessorKey: 'nombre' },
      { header: 'Descripción', cell: ({ row }) => row.original.descripcion ?? '—' },
      {
        header: 'Acciones',
        cell: ({ row }) => {
          const categoria = row.original
          return (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => abrirEdicion(categoria)}>
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={eliminar.isPending}
                onClick={() => {
                  if (window.confirm(`¿Dar de baja la categoría «${categoria.nombre}»?`)) {
                    eliminar.mutate(categoria.id)
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          )
        },
      },
    ],
    [eliminar],
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={abrirNueva}>+ Nueva categoría</Button>
      </div>

      {eliminar.isError && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {handleApiError(eliminar.error)}
        </p>
      )}

      {categorias.isPending ? (
        <SkeletonRows />
      ) : categorias.isError ? (
        <EstadoError mensaje={handleApiError(categorias.error)} onReintentar={() => void categorias.refetch()} />
      ) : categorias.data.length === 0 ? (
        <EstadoVacio titulo="No hay categorías" accion={<Button onClick={abrirNueva}>Crear la primera</Button>} />
      ) : (
        <DataTable data={categorias.data} columns={columns} />
      )}

      <CategoriaFormModal open={modalAbierto} categoria={editando} onClose={() => setModalAbierto(false)} />
    </div>
  )
}
