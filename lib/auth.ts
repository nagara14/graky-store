import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare, hash } from 'bcryptjs'
import { getUserByEmail, createUser } from './db'

const IS_DEV = process.env.NODE_ENV === 'development'

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] Login attempt for:', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          return null
        }

        try {
          const email = String(credentials.email).toLowerCase().trim()
          const password = String(credentials.password)

          // Basic email validation
          if (!email.includes('@')) {
            console.log('[Auth] Invalid email format')
            return null
          }

          // Fetch user from database
          const user = await getUserByEmail(email)

          if (!user) {
            console.log('[Auth] User not found:', email)
            return null
          }

          // Check if user is active
          if (!user.isActive) {
            console.log('[Auth] User account is inactive')
            return null
          }

          // Verify password
          const isPasswordValid = await compare(password, user.password)

          if (!isPasswordValid) {
            console.log('[Auth] Invalid password')
            return null
          }

          console.log('[Auth] Login successful for:', user.email)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'USER',
          }
        } catch (error: any) {
          console.error('[Auth] Error during login:', error)

          // Throw specific errors for better UX
          if (error.code === 'ECONNREFUSED') {
            throw new Error('DATABASE_CONNECTION_ERROR')
          }
          if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            throw new Error('DATABASE_ERROR')
          }

          throw error
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('[Auth] signIn callback - provider:', account?.provider)

      if (account?.provider === 'google') {
        try {
          const { email, name } = user

          if (!email) {
            console.error('[Auth] Google login: No email provided')
            return false
          }

          const existingUser = await getUserByEmail(email)

          if (!existingUser) {
            // Create new user for Google OAuth
            console.log('[Auth] Creating new user from Google login:', email)
            const randomPassword = Math.random().toString(36).slice(-12)
            const hashedPassword = await hash(randomPassword, 10)
            const newUser = await createUser(name || 'Google User', email, hashedPassword, 'USER')
            user.id = newUser.id
            user.role = newUser.role
            console.log('[Auth] New user created:', newUser.id)
          } else {
            user.id = existingUser.id
            user.role = existingUser.role
            console.log('[Auth] Existing user logged in:', existingUser.id)
          }

          return true
        } catch (error) {
          console.error('[Auth] Error in Google signIn:', error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role || 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
          ; (session.user as any).role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: IS_DEV,
  trustHost: true,
}

export const { handlers, auth } = NextAuth(authConfig)
export const authOptions = authConfig
