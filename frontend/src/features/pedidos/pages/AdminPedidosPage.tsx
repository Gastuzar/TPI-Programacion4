import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { Modal } from '../../../shared/ui/Modal'
import { Select } from '../../../shared/ui/Input'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { PedidosTable } from '../components/PedidosTable'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS } from '../types'
import type { EstadoPedido, Pedido } from '../types'

const POR_PAGINA = 10

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(1)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)

  const pedidos = usePedidos({ skip: (pagina - 1) * POR_PAGINA, limit: POR_PAGINA, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  const manejarCambio = (pedido: Pedido, destino: EstadoPedido) => {
    const mensaje =
      destino === 'CANCELADO'
        ? `¿Cancelar el pedido #${pedido.id}? Se restituirá el stock.`
        : `¿Pasar el pedido #${pedido.id} a «${destino}»?`
    if (window.confirm(mensaje)) {
      cambiarEstado.mutate({ id: pedido.id, estado: destino })
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="w-56">
          <Select
            label="Filtrar por estado"
            value={estado ?? ''}
            onChange={(e) => {
              setEstado(e.target.value === '' ? undefined : (e.target.value as EstadoPedido))
              setPagina(1)
            }}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {cambiarEstado.isError && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {handleApiError(cambiarEstado.error)}
        </p>
      )}

      {pedidos.isPending ? (
        <SkeletonRows />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio titulo="No hay pedidos" descripcion={estado ? 'No hay pedidos en ese estado.' : undefined} />
      ) : (
        <>
          <PedidosTable
            pedidos={pedidos.data.items}
            procesando={cambiarEstado.isPending}
            onVerDetalle={setDetalle}
            onCambiarEstado={manejarCambio}
          />
          <Paginacion pagina={pagina} total={pedidos.data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}

      <Modal open={detalle !== null} title={detalle ? `Pedido #${detalle.id}` : ''} onClose={() => setDetalle(null)}>
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>
    </div>
  )
}
