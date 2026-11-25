import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import type { Pedido } from '../types'

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-slate-500">{formatFecha(pedido.created_at)}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-slate-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="text-slate-500">Forma de pago</dt>
        <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        {pedido.notas && (
          <>
            <dt className="text-slate-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
      </dl>
      <table className="w-full">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="py-1">Producto</th>
            <th className="py-1 text-right">Cant.</th>
            <th className="py-1 text-right">P. unit.</th>
            <th className="py-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-1.5">{item.nombre_producto}</td>
              <td className="py-1.5 text-right">{item.cantidad}</td>
              <td className="py-1.5 text-right">{formatPrecio(item.precio_unitario)}</td>
              <td className="py-1.5 text-right">{formatPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={3} className="pt-2 text-right">
              Total
            </td>
            <td className="pt-2 text-right">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
