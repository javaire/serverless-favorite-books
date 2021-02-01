export interface BookItem {
  userId: string
  bookId: string
  createdAt: string
  name: string
  author: string
  reviewUrl: string
  done: boolean
  attachmentUrl?: string
}
