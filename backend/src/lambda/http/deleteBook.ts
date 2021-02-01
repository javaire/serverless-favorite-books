import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { deleteBook } from '../../businessLogic/books'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('deleteBook')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing deleteBook event', { event })

  const userId = getUserId(event)
  const bookId = event.pathParameters.bookId
  
  try {
    await deleteBook(userId, bookId)
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
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
