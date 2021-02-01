import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = process.env.AUTH_0_JWKS_URL
let cachedCertificate: string

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const cert = await getCertificate(jwt.header.kid)

  logger.info(`Verifying token ${token}`)

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getCertificate(kid : string): Promise<string> {
  if (cachedCertificate) return cachedCertificate

  logger.info(`Fetching certificate from ${jwksUrl}`)

  const response = await Axios.get(jwksUrl)
  const keys = response.data.keys

  if (!keys || !keys.length)
    throw new Error('No JWKS keys found')

  const signingKeys = keys.filter(
    key => key.use === 'sig' // JWK property `use` determines the JWK is for signature verification
        && key.kty === 'RSA' // We are only supporting RSA (RS256)
        && key.kid           // The `kid` must be present to be useful for later
        && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
  )

  if (!signingKeys.length)
    throw new Error('No JWKS signing keys found')
  
  const signingKey = signingKeys.find(key => key.kid === kid);
  const pub = signingKey.x5c[0]  // public key

  // Certificate found!
  cachedCertificate = certToPEM(pub)

  logger.info('Valid certificate found', cachedCertificate)

  return cachedCertificate
}

function certToPEM(cert: string): string {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}
