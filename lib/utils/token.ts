import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.TOKEN_SECRET
const key = new TextEncoder().encode(secretKey)
export async function asyncEncode(token: any) {
  const jwt = await new SignJWT(token)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(key)
  return jwt
}

export async function asyncDecode(token: any) {
  const { payload } = await jwtVerify(token, key, {
    algorithms: ['HS256'],
  })
  return payload
}
