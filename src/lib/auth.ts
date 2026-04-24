import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          console.log('Login attempt failed: Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone.trim(),
          }
        })

        if (!user || !user.password || !user.isActive) {
          console.log(`Login failed: User not found, inactive, or no password set for ${credentials.phone}`)
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          console.log(`Login failed: Invalid password for ${user.phone}`)
          return null
        }

        console.log(`Login successful for ${user.phone} (${user.role})`)

        // Update login stats in background
        prisma.user.update({
          where: { id: user.id },
          data: { 
            isOnline: true, 
            lastLoginAt: new Date(),
            lastActive: new Date()
          }
        }).catch(e => console.error("Update login error:", e))

        return {
          id: user.id,
          phone: user.phone,
          name: user.fullName || '',
          role: user.role
        } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.phone = (user as any).phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phone = token.phone as string;
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}

