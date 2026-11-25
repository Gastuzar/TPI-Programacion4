import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/format'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo."
        accion={
          <Link to="/">
            <Button>Ir al catálogo</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
      <Card className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-40 flex-1">
              <p className="font-medium">{item.nombre}</p>
              <p className="text-sm text-slate-500">{formatPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>
                −
              </Button>
              <span className="w-8 text-center">{item.cantidad}</span>
              <Button variant="secondary" size="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}>
                +
              </Button>
            </div>
            <p className="w-28 text-right font-semibold">{formatPrecio(item.precio_unitario * item.cantidad)}</p>
            <Button variant="ghost" size="sm" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={vaciar}>
            Vaciar carrito
          </Button>
          <p className="text-lg">
            Total: <span className="font-bold">{formatPrecio(total)}</span>
          </p>
        </div>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => navigate(usuario ? '/checkout' : '/login', { state: { from: '/checkout' } })}>
          {usuario ? 'Confirmar pedido' : 'Ingresá para confirmar el pedido'}
        </Button>
      </div>
    </div>
  )
}
