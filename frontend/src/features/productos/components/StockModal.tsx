import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { primerError } from '../../../shared/utils/format'
import { useActualizarStock } from '../hooks/useProductos'
import type { Producto } from '../types'

function StockForm({ producto, onClose }: { producto: Producto; onClose: () => void }) {
  const actualizarStock = useActualizarStock()

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      try {
        await actualizarStock.mutateAsync({ id: producto.id, input: value })
        onClose()
      } catch {
        // se muestra actualizarStock.error
      }
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <p className="text-sm text-slate-600">{producto.nombre}</p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : 'Entero mayor o igual a 0'),
        }}
      >
        {(field) => (
          <Input
            label="Stock"
            type="number"
            min={0}
            step="1"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      {actualizarStock.isError && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700" role="alert">
          {handleApiError(actualizarStock.error)}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={actualizarStock.isPending}>
          {actualizarStock.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

interface StockModalProps {
  producto: Producto | null
  onClose: () => void
}

export function StockModal({ producto, onClose }: StockModalProps) {
  return (
    <Modal open={producto !== null} title="Stock y disponibilidad" onClose={onClose}>
      {producto && <StockForm key={producto.id} producto={producto} onClose={onClose} />}
    </Modal>
  )
}
