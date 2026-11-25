import { api } from '../../../shared/api/axiosInstance'
import type { Paginado } from '../../../shared/api/types'
import type { EstadoPedido, Pedido, PedidoCreate, PedidoFiltros, ResumenPedidos } from '../types'

export const pedidosApi = {
  async listar(filtros: PedidoFiltros): Promise<Paginado<Pedido>> {
    const { data } = await api.get<Paginado<Pedido>>('/pedidos', { params: filtros })
    return data
  },
  async resumen(): Promise<ResumenPedidos> {
    const { data } = await api.get<ResumenPedidos>('/pedidos/resumen')
    return data
  },
  async crear(input: PedidoCreate): Promise<Pedido> {
    const { data } = await api.post<Pedido>('/pedidos', input)
    return data
  },
  async cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
    return data
  },
  async cancelar(id: number): Promise<Pedido> {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`)
    return data
  },
}
