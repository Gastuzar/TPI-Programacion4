export interface Paginado<T> {
  total: number
  items: T[]
  page?: number | null
  size?: number | null
  pages?: number | null
}
