import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { DataTable } from '../../../shared/components/DataTable'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { TRANSICIONES } from '../types'
import type { EstadoPedido, Pedido } from '../types'

interface PedidosTableProps {
  pedidos: Pedido[]
  procesando: boolean
  onVerDetalle: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
}

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

export function PedidosTable({ pedidos, procesando, onVerDetalle, onCambiarEstado }: PedidosTableProps) {
  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { header: '#', accessorKey: 'id' },
      { header: 'Cliente (id)', accessorKey: 'usuario_id' },
      { header: 'Fecha', cell: ({ row }) => formatFecha(row.original.created_at) },
      { header: 'Pago', cell: ({ row }) => (row.original.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia') },
      { header: 'Total', cell: ({ row }) => formatPrecio(row.original.total) },
      { header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
      {
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original
          return (
            <div className="flex flex-wrap gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => onVerDetalle(pedido)}>
                Detalle
              </Button>
              {TRANSICIONES[pedido.estado].map((destino) => (
                <Button
                  key={destino}
                  size="sm"
                  variant={destino === 'CANCELADO' ? 'danger' : 'primary'}
                  disabled={procesando}
                  onClick={() => onCambiarEstado(pedido, destino)}
                >
                  {ETIQUETA_ACCION[destino]}
                </Button>
              ))}
            </div>
          )
        },
      },
    ],
    [procesando, onVerDetalle, onCambiarEstado],
  )

  return <DataTable data={pedidos} columns={columns} pageSize={100} />
}
