import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriasApi } from '../api/categorias'
import type { CategoriaInput } from '../types'

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.listar })
}

export function useCrearCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoriaInput) => categoriasApi.crear(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useActualizarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CategoriaInput }) => categoriasApi.actualizar(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useEliminarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriasApi.eliminar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}
