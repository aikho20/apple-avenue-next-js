import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from './db'
import bcrypt from 'bcrypt'
import User from './model/user.model'
import mongoose from 'mongoose'

export const nextauthOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', required: true },
        password: { label: 'Password', type: 'password', required: true },
      },
      async authorize(credentials) {
        try {
          const connected = await connectDB()
          if (!connected || mongoose.connection.readyState !== 1) {
            throw new Error('Database unavailable - please try again in a moment')
          }
          if (!credentials?.email || !credentials?.password) {
            return null
          }
          const user = await User.findOne({ email: credentials.email })

          if (!user) {
            throw new Error('Invalid email or password')
          }

          const passwordIsValid = await bcrypt.compare(credentials.password, user.password)

          if (!passwordIsValid) {
            throw new Error('Invalid email or password')
          }

          return { ...user._doc, _id: user._id.toString() }
        } catch (err: any) {
          // Re-throw with clean message so NextAuth shows it to user instead of hanging
          throw new Error(err.message || 'Authentication failed - database error')
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.type === 'oauth' && profile) {
        try {
          const connected = await connectDB()
          if (!connected || mongoose.connection.readyState !== 1) {
            console.log('signIn skipped DB write - DB unavailable')
            return true
          }
          const user = await User.findOne({ email: profile.email })

          if (user) return true

          const newUser = new User({
            name: profile.name,
            email: profile.email,
            image: (profile as any).picture || (profile as any).image,
            provider: account.provider,
          })

          await newUser.save()
          return true
        } catch (e: any) {
          console.log('signIn DB error (non-blocking):', e.message)
          return true
        }
      }
      return true
    },
    async jwt({ token, trigger, session }) {
      if (trigger === 'update') {
        token.name = session.name
      } else {
        if (token.email) {
          try {
            const connected = await connectDB()
            if (!connected || mongoose.connection.readyState !== 1) {
              return token
            }
            const user = await User.findOne({ email: token.email }).select('-password')
            if (user) {
              token.name = user.name
              token._id = user._id
              token.role = user.role
              token.provider = user.provider
            }
          } catch {
            // DB down - return token as-is so session still works
            return token
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          name: token.name,
          _id: token._id,
          role: token.role,
          provider: token.provider,
        },
      }
    },
  },
}
