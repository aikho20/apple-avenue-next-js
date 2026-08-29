import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    _id: string
    role: string
    provider: string
  }
  interface Session {
    user: User & {
      _id: string
      role: string
      provider: string
    }
    param: string
    token: {
      _id: string
      role: string
      provider: string
    }
  }
}
