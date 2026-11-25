import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../api/productos'
import type { ProductoFiltros, ProductoInput, ProductoStockInput } from '../types'

export function useProductos(filtros: ProductoFiltros) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => productosApi.listar(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useCrearProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductoInput) => productosApi.crear(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useActualizarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ProductoInput> }) => productosApi.actualizar(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useActualizarStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductoStockInput }) => productosApi.actualizarStock(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useEliminarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productosApi.eliminar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}
