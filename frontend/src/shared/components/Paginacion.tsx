import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number
  total: number
  porPagina: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, total, porPagina, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / porPagina))
  if (paginas <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm">
      <Button variant="secondary" size="sm" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </Button>
      <span className="text-slate-600">
        Página {pagina} de {paginas}
      </span>
      <Button variant="secondary" size="sm" disabled={pagina >= paginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente →
      </Button>
    </div>
  )
}
