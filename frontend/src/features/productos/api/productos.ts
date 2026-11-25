import { api } from '../../../shared/api/axiosInstance'
import type { Paginado } from '../../../shared/api/types'
import type { Producto, ProductoFiltros, ProductoInput, ProductoStockInput } from '../types'

export const productosApi = {
  async listar(filtros: ProductoFiltros): Promise<Paginado<Producto>> {
    const { data } = await api.get<Paginado<Producto>>('/productos', { params: filtros })
    return data
  },
  async crear(input: ProductoInput): Promise<Producto> {
    const { data } = await api.post<Producto>('/productos', input)
    return data
  },
  async actualizar(id: number, input: Partial<ProductoInput>): Promise<Producto> {
    const { data } = await api.put<Producto>(`/productos/${id}`, input)
    return data
  },
  async actualizarStock(id: number, input: ProductoStockInput): Promise<Producto> {
    const { data } = await api.patch<Producto>(`/productos/${id}/stock`, input)
    return data
  },
  async eliminar(id: number): Promise<void> {
    await api.delete(`/productos/${id}`)
  },
}
