import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { formatPrecio } from '../../../shared/utils/format'
import { ProductoFormModal } from '../components/ProductoFormModal'
import { StockModal } from '../components/StockModal'
import { useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { Producto } from '../types'

export function AdminProductosPage() {
  const productos = useProductos({ limit: 100 }) 
  const eliminar = useEliminarProducto()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [stockDe, setStockDe] = useState<Producto | null>(null)

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Nombre', accessorKey: 'nombre' },
      { header: 'Categoría', cell: ({ row }) => row.original.categoria?.nombre ?? '—' },
      { header: 'Precio', cell: ({ row }) => formatPrecio(row.original.precio_base) },
      {
        header: 'Stock',
        cell: ({ row }) => (
          <span className={row.original.stock === 0 ? 'font-semibold text-red-600' : ''}>{row.original.stock}</span>
        ),
      },
      {
        header: 'Disponible',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${row.original.disponible ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}
          >
            {row.original.disponible ? 'Sí' : 'No'}
          </span>
        ),
      },
      {
        header: 'Acciones',
        cell: ({ row }) => {
          const producto = row.original
          return (
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditando(producto)
                  setModalAbierto(true)
                }}
              >
                Editar
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setStockDe(producto)}>
                Stock
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={eliminar.isPending}
                onClick={() => {
                  if (window.confirm(`¿Dar de baja «${producto.nombre}»?`)) eliminar.mutate(producto.id)
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
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button
          onClick={() => {
            setEditando(null)
            setModalAbierto(true)
          }}
        >
          + Nuevo producto
        </Button>
      </div>

      {eliminar.isError && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {handleApiError(eliminar.error)}
        </p>
      )}

      {productos.isPending ? (
        <SkeletonRows />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio titulo="No hay productos" />
      ) : (
        <DataTable data={productos.data.items} columns={columns} />
      )}

      <ProductoFormModal open={modalAbierto} producto={editando} onClose={() => setModalAbierto(false)} />
      <StockModal producto={stockDe} onClose={() => setStockDe(null)} />
    </div>
  )
}
