import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { updateBook } from '../../businessLogic/books'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('updateBook')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing updateBook event', { event })

  const userId = getUserId(event)
  const bookId = event.pathParameters.bookId
  const updatedBook: UpdateBookRequest = JSON.parse(event.body)

  try {
    await updateBook(userId, bookId, updatedBook)
  } catch (e) {
    if (e.message == 'Not Found') {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: e.message
        })
      }
    } else if (e.message == 'Forbidden'){
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: e.message
        })
      }
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
