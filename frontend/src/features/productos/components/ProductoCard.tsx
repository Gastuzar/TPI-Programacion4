import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const sinStock = producto.stock <= 0
  const noDisponible = !producto.disponible || sinStock
  const alLimite = enCarrito >= producto.stock

  return (
    <Card className="flex flex-col overflow-hidden">
      {producto.imagen_url ? (
        <img src={producto.imagen_url} alt={producto.nombre} className="h-36 w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-orange-50 text-4xl">🍽️</div>
      )}
      <div className="flex flex-1 flex-col p-3">
        {producto.categoria && <span className="text-xs font-medium uppercase text-orange-600">{producto.categoria.nombre}</span>}
        <h3 className="font-semibold">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{producto.descripcion}</p>}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{formatPrecio(producto.precio_base)}</span>
            <span className={`text-xs ${sinStock ? 'text-red-600' : 'text-slate-500'}`}>
              {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
            </span>
          </div>
          <Button
            className="mt-2 w-full"
            disabled={noDisponible || alLimite}
            onClick={() =>
              agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })
            }
          >
            {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : alLimite ? 'Máximo en carrito' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
