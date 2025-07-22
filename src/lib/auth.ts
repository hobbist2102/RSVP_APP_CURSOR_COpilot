import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { users } from '@/lib/db/schema'

export const authOptions: NextAuthOptions = {
  // adapter: DrizzleAdapter(db), // Temporarily disabled for build
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user by email
          const user = await db.select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1)

          if (!user.length || !user[0].password_hash) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user[0].password_hash
          )

          if (!isValidPassword) {
            return null
          }

          // Update last login
          await db.update(users)
            .set({ 
              last_login: new Date(),
              updated_at: new Date()
            })
            .where(eq(users.id, user[0].id))

          return {
            id: user[0].id,
            email: user[0].email,
            name: `${user[0].first_name} ${user[0].last_name}`,
            image: user[0].avatar_url,
            role: user[0].role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        }
      }

      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        }
      }
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-ins
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await db.select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1)

          if (!existingUser.length) {
            // Create new user from OAuth
            const [firstName, ...lastNameParts] = user.name?.split(' ') || ['', '']
            const lastName = lastNameParts.join(' ') || ''

            await db.insert(users).values({
              email: user.email!,
              first_name: firstName,
              last_name: lastName,
              avatar_url: user.image,
              email_verified: true,
              role: 'couple', // Default role
            })
          }

          return true
        } catch (error) {
          console.error('OAuth sign-in error:', error)
          return false
        }
      }

      return true
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`)
    },
    async signOut({ session, token }) {
      console.log(`User signed out`)
    },
  },
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}