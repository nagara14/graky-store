import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare, hash } from 'bcryptjs'
import { getUserByEmail, createUser, updateUser } from './db'
import { loginRateLimiter } from './ratelimit'
import { validateEmail, validatePassword } from './validation'

const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Delay function to prevent timing attacks
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (IS_DEV) console.log('[Auth] Login attempt initiated')

        if (!credentials?.email || !credentials?.password) {
          if (IS_DEV) console.log('[Auth] Missing credentials')
          await delay(1000) // Prevent timing attacks
          return null
        }

        try {
          const email = (credentials as any)?.email?.toLowerCase().trim()
          const password = (credentials as any)?.password

          // Validate email format
          if (!email || !validateEmail(email)) {
            if (IS_DEV) console.log('[Auth] Invalid email format')
            await delay(1000)
            return null
          }

          // Rate limiting check
          const rateLimitOk = loginRateLimiter.check(email)
          if (!rateLimitOk) {
            const resetTime = loginRateLimiter.getResetTime(email)
            if (IS_DEV) {
              console.log(`[Auth] Rate limited. Reset in ${resetTime}s`)
            }
            await delay(2000) // Extra delay for rate limited requests
            return null
          }

          // Fetch user with timeout
          const userPromise = getUserByEmail(email)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
          )

          const user = await Promise.race([userPromise, timeoutPromise]) as any

          if (!user) {
            if (IS_DEV) console.log('[Auth] User not found')
            await delay(1000) // Consistent timing
            return null
          }

          // Check if account is locked
          if (user.lockoutUntil) {
            const lockoutTime = new Date(user.lockoutUntil)
            const now = new Date()

            if (now < lockoutTime) {
              const remainingMs = lockoutTime.getTime() - now.getTime()
              const remainingMin = Math.ceil(remainingMs / 60000)
              if (IS_DEV) {
                console.log(`[Auth] Account locked for ${remainingMin} more minutes`)
              }
              await delay(2000)
              return null
            } else {
              // Lockout expired, reset
              await updateUser(user.id, {
                lockoutUntil: null,
                failedLoginAttempts: 0
              })
              user.lockoutUntil = null
              user.failedLoginAttempts = 0
            }
          }

          // Check if user is active
          if (!user.isActive) {
            if (IS_DEV) console.log('[Auth] User account is inactive')
            await delay(1000)
            return null
          }

          // Verify password
          const isPasswordValid = await compare(password, user.password)

          if (!isPasswordValid) {
            // Increment failed attempts
            const newAttempts = (user.failedLoginAttempts || 0) + 1

            if (newAttempts >= 5) {
              // Lock account for 15 minutes
              const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000)
              // Convert Date to MySQL datetime format
              const lockoutDatetime = lockoutUntil.toISOString().slice(0, 19).replace('T', ' ')
              await updateUser(user.id, {
                failedLoginAttempts: newAttempts,
                lockoutUntil: lockoutDatetime
              })
              if (IS_DEV) {
                console.log('[Auth] Account locked due to 5 failed attempts')
              }
            } else {
              await updateUser(user.id, { failedLoginAttempts: newAttempts })
              if (IS_DEV) {
                console.log(`[Auth] Failed attempt ${newAttempts}/5`)
              }
            }

            await delay(1000)
            return null
          }

          // Password is valid - reset failed attempts and update last login
          const lastLogin = new Date().toISOString().slice(0, 19).replace('T', ' ')
          await updateUser(user.id, {
            failedLoginAttempts: 0,
            lockoutUntil: null,
            lastLoginAt: lastLogin
          })

          // Reset rate limiter on successful login
          loginRateLimiter.reset(email)

          if (IS_DEV) console.log('[Auth] Login successful')

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'USER',
          }
        } catch (error) {
          if (IS_DEV) console.error('[Auth] authorize error:', error)
          await delay(1000)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === 'google') {
        try {
          const { email, name } = user
          const existingUser = await getUserByEmail(email)

          if (!existingUser) {
            // Create new user if not exists
            const randomPassword = Math.random().toString(36).slice(-8)
            const hashedPassword = await hash(randomPassword, 10)
            const newUser = await createUser(name, email, hashedPassword, 'USER')
            user.id = newUser.id
            user.role = newUser.role
          } else {
            user.id = existingUser.id
            user.role = existingUser.role
          }
          return true
        } catch (error) {
          console.error('Error in Google signIn:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }: any) {
      try {
        if (IS_DEV) console.log('[Auth] JWT callback')
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.role = user.role
        }
        return token
      } catch (error) {
        if (IS_DEV) console.error('[Auth] JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }: any) {
      try {
        if (IS_DEV) console.log('[Auth] Session callback')
        if (session.user) {
          session.user.id = token.id as string
          session.user.email = token.email as string
          session.user.name = token.name as string
            ; (session.user as any).role = token.role as string
        }
        return session
      } catch (error) {
        if (IS_DEV) console.error('[Auth] Session callback error:', error)
        return session
      }
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
  // Trust host in development, or if explicitly set in production
  trustHost: process.env.NODE_ENV === 'development' || process.env.AUTH_TRUST_HOST === 'true',
}

export const { handlers, auth } = NextAuth(authConfig)
export const authOptions = authConfig
