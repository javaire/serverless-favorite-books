import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { BookItem } from '../models/BookItem'
import { BookUpdate } from '../models/BookUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('booksAccess')

const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

export class BooksAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly booksTable = process.env.BOOKS_TABLE,
    private readonly booksByUserIndex = process.env.BOOKS_USER_INDEX
  ) {}

  async getBookItems(userId: string): Promise<BookItem[]> {
    logger.info(`Getting all books for user ${userId} from ${this.booksTable}`)

    const result = await this.docClient.query({
      TableName: this.booksTable,
      IndexName: this.booksByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items

    logger.info(`Found ${items.length} books for user ${userId} in ${this.booksTable}`)

    return items as BookItem[]
  }

  async createBookItem(BookItem: BookItem) {
    logger.info(`Putting book ${BookItem.bookId} into ${this.booksTable}`)

    await this.docClient.put({
      TableName: this.booksTable,
      Item: BookItem,
    }).promise()
  }

  async getBookItem(userId:string, bookId: string): Promise<BookItem> {
    logger.info(`Getting book ${bookId} ${userId} from ${this.booksTable}`)

    const result = await this.docClient.get({
      TableName: this.booksTable,
      Key: {
        userId,
        bookId
      }
    }).promise()

    const item = result.Item

    return item as BookItem
  }

  async deleteBookItem(userId: string, bookId: string) {
    logger.info(`Deleting BOOK item ${bookId} from ${this.booksTable}`)

    await this.docClient.delete({
      TableName: this.booksTable,
      Key: {
        userId,
        bookId
      }
    }).promise()
  }

  async updateBookItem(bookId: string, bookUpdate: BookUpdate) {
    logger.info(`Updating BOOK item ${bookId} in ${this.booksTable}`)

    await this.docClient.update({
      TableName: this.booksTable,
      Key: {
        bookId
      },
      UpdateExpression: 'set #name = :name, author = :author, reviewUrl = :reviewUrl, done = :done',
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": bookUpdate.name,
        ":author": bookUpdate.author,
        ":reviewUrl": bookUpdate.reviewUrl,
        ":done": bookUpdate.done
      }
    }).promise()
  }

  async updateAttachmentUrl(userId: string, bookId: string, attachmentUrl: string) {
    logger.info(`Updating attachment URL ${attachmentUrl} for book ${bookId} and userId in ${this.booksTable}`)

    await this.docClient.update({
      TableName: this.booksTable,
      Key: {
        userId,
        bookId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

}
