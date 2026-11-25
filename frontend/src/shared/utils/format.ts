const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })

export function formatPrecio(valor: number): string {
  return moneda.format(valor)
}

export function formatFecha(iso: string): string {
  // el backend guarda fechas UTC sin zona: se interpretan como UTC
  const fecha = new Date(iso.endsWith('Z') ? iso : `${iso}Z`)
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

export function primerError(errores: unknown[]): string | undefined {
  return errores.find((e): e is string => typeof e === 'string')
}
