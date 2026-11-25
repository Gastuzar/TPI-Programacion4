import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatPrecio } from '../../../shared/utils/format'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Resumen del negocio</h1>
      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError mensaje={handleApiError(resumen.error)} onReintentar={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos pendientes" valor={resumen.data.pendientes} color="text-amber-600" />
          <ResumenCard titulo="En preparación" valor={resumen.data.en_preparacion} color="text-blue-600" />
          <ResumenCard titulo="Entregados" valor={resumen.data.entregados} color="text-green-600" />
          <ResumenCard titulo="Cancelados" valor={resumen.data.cancelados} color="text-red-600" />
          <ResumenCard titulo="Pedidos de hoy" valor={resumen.data.pedidos_hoy} />
          <ResumenCard titulo="Ingresos (entregados)" valor={formatPrecio(resumen.data.ingresos_entregados)} color="text-orange-600" />
        </div>
      )}
    </div>
  )
}
