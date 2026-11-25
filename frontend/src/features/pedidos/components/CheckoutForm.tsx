import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, Textarea } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/format'
import type { FormaPago } from '../types'

export interface CheckoutValues {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  enviando: boolean
  onSubmit: (values: CheckoutValues) => Promise<void>
}

export function CheckoutForm({ enviando, onSubmit }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' } as CheckoutValues,
    onSubmit: async ({ value }) => onSubmit(value),
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            placeholder="Calle, número, piso/depto"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>
      <form.Field name="notas">
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? 'Confirmando…' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
