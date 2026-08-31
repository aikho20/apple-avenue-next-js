// export { default } from "next-auth/middleware"

// export const config = { matcher: ["/profile"] }

import { NextAuthMiddlewareOptions, withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const { pathname, origin } = req.nextUrl
    if (pathname.startsWith('/dashboard') && token?.role !== 'admin' && token?.role !== 'branch') {
      return NextResponse.redirect(`${origin}/unauthorized`)
    }
  },
  {
    callbacks: {
      authorized: (params) => {
        let { token } = params
        return !!token
      },
    },
  } as NextAuthMiddlewareOptions
)

export const config = {
  matcher: ['/account/:path*', '/store/checkout', '/store/checkout/:path*', '/dashboard/:path*'],
}
