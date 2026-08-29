import NextAuth from "next-auth"
import { nextauthOptions } from "@/lib/next-auth-option"

const handler = NextAuth(nextauthOptions)

export { handler as GET, handler as POST }