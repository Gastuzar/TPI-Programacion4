import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'
import type { EstadoPedido, PedidoCreate, PedidoFiltros } from '../types'

export function usePedidos(filtros: PedidoFiltros) {
  return useQuery({
    queryKey: ['pedidos', 'lista', filtros],
    queryFn: () => pedidosApi.listar(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: pedidosApi.resumen })
}

export function useCrearPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PedidoCreate) => pedidosApi.crear(input),
    onSuccess: async () => {
      // el stock cambió: se refrescan pedidos y catálogo
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['pedidos'] }),
        qc.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}

export function useCambiarEstadoPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => pedidosApi.cambiarEstado(id, estado),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['pedidos'] }),
        qc.invalidateQueries({ queryKey: ['productos'] }), // cancelar restituye stock
      ])
    },
  })
}

export function useCancelarPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pedidosApi.cancelar(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['pedidos'] }),
        qc.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
