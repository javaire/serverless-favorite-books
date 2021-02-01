import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as uuid from 'uuid'

import { generateUploadUrl, updateAttachmentUrl } from '../../businessLogic/books'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing generateUploadUrl event', { event })

  const userId = getUserId(event)
  const bookId = event.pathParameters.bookId
  const attachmentId = uuid.v4()

  const uploadUrl = await generateUploadUrl(attachmentId)
  try {
    await updateAttachmentUrl(userId, bookId, attachmentId)
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
    body: JSON.stringify({
      uploadUrl
    })
  }
}

