import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { primerError } from '../../../shared/utils/format'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useActualizarProducto, useCrearProducto } from '../hooks/useProductos'
import type { Producto, ProductoInput } from '../types'

interface ProductoFormProps {
  producto: Producto | null
  onClose: () => void
}

interface ProductoValues {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  categoria_id: number
}

function ProductoForm({ producto, onClose }: ProductoFormProps) {
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const mutation = producto ? actualizar : crear

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    } as ProductoValues,
    onSubmit: async ({ value }) => {
      const input: ProductoInput = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: value.categoria_id,
      }
      try {
        if (producto) await actualizar.mutateAsync({ id: producto.id, input })
        else await crear.mutateAsync(input)
        onClose()
      } catch {
        // se muestra mutation.error
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
      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio') }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            error={primerError(field.state.meta.errors)}
          >
            <option value={0}>Seleccionar…</option>
            {categorias.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="precio_base"
          validators={{ onChange: ({ value }) => (value >= 0 ? undefined : 'Debe ser mayor o igual a 0') }}
        >
          {(field) => (
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))}
              error={primerError(field.state.meta.errors)}
            />
          )}
        </form.Field>
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
      </div>
      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen (opcional)"
            type="url"
            placeholder="https://…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            label="Descripción"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
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
      {mutation.isError && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700" role="alert">
          {handleApiError(mutation.error)}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

interface ProductoFormModalProps {
  open: boolean
  producto: Producto | null
  onClose: () => void
}

export function ProductoFormModal({ open, producto, onClose }: ProductoFormModalProps) {
  return (
    <Modal open={open} title={producto ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
      <ProductoForm key={producto?.id ?? 'nuevo'} producto={producto} onClose={onClose} />
    </Modal>
  )
}
