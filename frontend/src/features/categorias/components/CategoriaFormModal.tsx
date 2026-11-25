import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input, Textarea } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { primerError } from '../../../shared/utils/format'
import { useActualizarCategoria, useCrearCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

interface CategoriaFormProps {
  categoria: Categoria | null
  onClose: () => void
}

function CategoriaForm({ categoria, onClose }: CategoriaFormProps) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const mutation = categoria ? actualizar : crear

  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      const input = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }
      try {
        if (categoria) await actualizar.mutateAsync({ id: categoria.id, input })
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
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo < 2 || largo > 100 ? 'El nombre debe tener entre 2 y 100 caracteres' : undefined
          },
        }}
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

interface CategoriaFormModalProps {
  open: boolean
  categoria: Categoria | null
  onClose: () => void
}

export function CategoriaFormModal({ open, categoria, onClose }: CategoriaFormModalProps) {
  return (
    <Modal open={open} title={categoria ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
      {/* key: reinicia el formulario al cambiar de categoría */}
      <CategoriaForm key={categoria?.id ?? 'nueva'} categoria={categoria} onClose={onClose} />
    </Modal>
  )
}
