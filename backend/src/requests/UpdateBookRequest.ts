/**
 * Fields in a request to update a single BOOK item.
 */
export interface UpdateBookRequest {
  name: string
  author: string
  reviewUrl: string
  done: boolean
}