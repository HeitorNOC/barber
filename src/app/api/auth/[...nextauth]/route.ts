import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
        }
      },
      profile: (profile: GoogleProfile) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.picture,
          emailVerified: profile.email_verified
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@email.com" },
        hashedPassword: { label: "Senha", type: "password" }
      },
      async authorize(credentials, req) {
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: credentials?.email,
            hashedPassword: credentials?.hashedPassword,
          }),
        })

        if (res.status === 401) return null
        const user = await res.json()

        if (user) {
          return user
        } else {
          return null
        }
      },
    })
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET as string,
  callbacks: {
    async signIn({ account }) {
      
        
        return true // Do different verification for other providers that don't have `email_verified`
      
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user }
      }
      return { ...token, ...user }
    },

    
    async session({ session, user, token }) {
      if (token) {
        session.user = token as any
      }
      return {
        ...session,
        user
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }