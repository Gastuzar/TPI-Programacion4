import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'

const POR_PAGINA = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1)
  const [abierto, setAbierto] = useState<number | null>(null)
  const pedidos = usePedidos({ skip: (pagina - 1) * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const pedirCancelacion = (id: number) => {
    if (window.confirm(`¿Cancelar el pedido #${id}? Se restituirá el stock.`)) {
      cancelar.mutate(id)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>

      {cancelar.isError && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {handleApiError(cancelar.error)}
        </p>
      )}

      {pedidos.isPending ? (
        <SkeletonRows />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          descripcion="Cuando confirmes tu primer pedido, lo vas a ver acá."
          accion={
            <Link to="/">
              <Button>Ver catálogo</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {pedidos.data.items.map((pedido) => (
              <Card key={pedido.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">Pedido #{pedido.id}</p>
                    <p className="text-sm text-slate-500">{formatFecha(pedido.created_at)}</p>
                  </div>
                  <BadgeEstado estado={pedido.estado} />
                  <p className="font-bold">{formatPrecio(pedido.total)}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}>
                      {abierto === pedido.id ? 'Ocultar detalle' : 'Ver detalle'}
                    </Button>
                    {pedido.estado === 'PENDIENTE' && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={cancelar.isPending}
                        onClick={() => pedirCancelacion(pedido.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
                {abierto === pedido.id && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <PedidoDetalle pedido={pedido} />
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} total={pedidos.data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
