import 'source-map-support/register'

import * as uuid from 'uuid'

import { BooksAccess } from '../dataLayer/BooksAccess'
import { BooksStorage } from '../dataLayer/BooksStorage'
import { BookItem } from '../models/BookItem'
import { BookUpdate } from '../models/BookUpdate'
import { CreateBookRequest } from '../requests/CreateBookRequest'
import { UpdateBookRequest } from '../requests/UpdateBookRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('books')

const booksAccess = new BooksAccess()
const booksStorage = new BooksStorage()

export async function getBooks(userId: string): Promise<BookItem[]> {
  logger.info(`Retrieving all books for user ${userId}`, { userId })

  return await booksAccess.getBookItems(userId)
}

export async function createBook(userId: string, createBookRequest: CreateBookRequest): Promise<BookItem> {
    const bookId = uuid.v4()
  
    const newItem: BookItem = {
      userId,
      bookId,
      createdAt: new Date().toISOString(),
      done: false,
      attachmentUrl: null,
      ...createBookRequest
    }
  
    logger.info(`Creating book ${bookId} for user ${userId}`, { userId, bookId, BookItem: newItem })
  
    await booksAccess.createBookItem(newItem)
  
    return newItem
  }

  export async function deleteBook(userId: string, bookId: string) {
    logger.info(`Deleting book ${bookId} for user ${userId}`, { userId, bookId })
  
    const item = await booksAccess.getBookItem(bookId)
  
    if (!item)
      throw new Error('Not Found')
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to delete book ${bookId}`)
      throw new Error('Forbidden')
    }
  
    booksAccess.deleteBookItem(bookId)
  }

  export async function updateBook(userId: string, bookId: string, updateBookRequest: UpdateBookRequest) {
    logger.info(`Updating book ${bookId} for user ${userId}`, { userId, bookId, bookUpdate: updateBookRequest })
  
    const item = await booksAccess.getBookItem(bookId)
  
    if (!item)
      throw new Error('Not Found')
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to update book ${bookId}`)
      throw new Error('Forbidden')
    }
  
    booksAccess.updateBookItem(bookId, updateBookRequest as BookUpdate)
  }

  export async function updateAttachmentUrl(userId: string, bookId: string, attachmentId: string) {
    logger.info(`Generating attachment URL for attachment ${attachmentId}`)
  
    const attachmentUrl = await booksStorage.getAttachmentUrl(attachmentId)
  
    logger.info(`Updating book ${bookId} with attachment URL ${attachmentUrl}`, { userId, bookId })
  
    const item = await booksAccess.getBookItem(bookId)
  
    if (!item)
      throw new Error('Not Found')
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to update book ${bookId}`)
      throw new Error('Forbidden')
    }
  
    await booksAccess.updateAttachmentUrl(bookId, attachmentUrl)
  }
  
  export async function generateUploadUrl(attachmentId: string): Promise<string> {
    logger.info(`Generating upload URL for attachment ${attachmentId}`)
  
    const uploadUrl = await booksStorage.getUploadUrl(attachmentId)
  
    return uploadUrl
  }