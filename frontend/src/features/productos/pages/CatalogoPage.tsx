import { useState } from 'react'
import type { FormEvent } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonGrid } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Input, Select } from '../../../shared/ui/Input'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(1)
  const [texto, setTexto] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const categorias = useCategorias()
  const productos = useProductos({
    skip: (pagina - 1) * POR_PAGINA, 
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    setSearch(texto.trim())
    setPagina(1)
  }

  const limpiar = () => {
    setTexto('')
    setSearch('')
    setCategoriaId(undefined)
    setPagina(1)
  }

  const hayFiltros = search !== '' || categoriaId !== undefined

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>

      <form onSubmit={buscar} className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input label="Buscar por nombre" placeholder="Ej: pizza" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
        <div className="w-56">
          <Select
            label="Categoría"
            value={categoriaId ?? ''}
            onChange={(e) => {
              setCategoriaId(e.target.value === '' ? undefined : Number(e.target.value))
              setPagina(1)
            }}
          >
            <option value="">Todas</option>
            {categorias.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Buscar</Button>
        {hayFiltros && (
          <Button variant="ghost" onClick={limpiar}>
            Limpiar filtros
          </Button>
        )}
      </form>

      {productos.isPending ? (
        <SkeletonGrid cantidad={POR_PAGINA} />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion={hayFiltros ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
          accion={hayFiltros ? <Button variant="secondary" onClick={limpiar}>Limpiar filtros</Button> : undefined}
        />
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${productos.isPlaceholderData ? 'opacity-60' : ''}`}>
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} total={productos.data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
