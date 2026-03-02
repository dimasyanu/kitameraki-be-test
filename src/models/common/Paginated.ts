export interface Paginated<T> {
  items: T[]
  totalCount: number
  startIndex: number
  pageSize: number
}