import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'
import type { CheckoutValues } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  if (items.length === 0 && !crearPedido.isSuccess) {
    return <Navigate to="/carrito" replace />
  }

  const confirmar = async (values: CheckoutValues) => {
    try {
      await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: values.forma_pago,
        direccion_entrega: values.direccion_entrega.trim(),
        notas: values.notas.trim() || null,
      })
      vaciar()
      navigate('/mis-pedidos')
    } catch {
      // el mensaje se muestra con crearPedido.error
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
        <Card className="p-5">
          <CheckoutForm enviando={crearPedido.isPending} onSubmit={confirmar} />
          {crearPedido.isError && (
            <p className="mt-4 rounded bg-red-50 p-2 text-sm text-red-700" role="alert">
              {handleApiError(crearPedido.error)}
            </p>
          )}
        </Card>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold md:mt-1.5">Resumen</h2>
        <Card className="divide-y divide-slate-100">
          {items.map((i) => (
            <div key={i.producto_id} className="flex justify-between p-3 text-sm">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span className="font-medium">{formatPrecio(i.cantidad * i.precio_unitario)}</span>
            </div>
          ))}
          <div className="flex justify-between p-3 font-bold">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
        </Card>
        <Link to="/carrito" className="mt-3 inline-block text-sm text-orange-600 hover:underline">
          ← Volver al carrito
        </Link>
      </div>
    </div>
  )
}
