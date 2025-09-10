import { NextAuthOptions, DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs';

// Extend the Session and User types to include id
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
  interface User {
    id: string
  }
}

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    // Example credentials provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Add your own logic here to validate credentials
        // This is just an example - use proper password hashing!
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) {
              return null;
            }

            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
            }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🔑 JWT callback:', {
        hasToken: !!token,
        hasUser: !!user,
        hasAccount: !!account
      })

      if (user) {
        token.id = user.id
        console.log('✅ Added user ID to token:', user.id)
      }
      return token
    },
    async session({ session, token }) {
      console.log('📋 Session callback:', {
        hasSession: !!session,
        hasToken: !!token,
        tokenId: token?.id
      })

      if (token && session.user) {
        session.user.id = token.id as string
        console.log('✅ Added user ID to session:', token.id)
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    // signUp: '/auth/signup',
  },
  debug: true, // Enable debug mode
  logger: {
    error(code, metadata) {
      console.error('🚨 NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('🔍 NextAuth Debug:', code, metadata)
    }
  },
}
