import NextAuth from "next-auth/next"

declare module 'next-auth' {
  interface Session {
    refreshTokenExpires?: number;
    accessTokenExpires?: string;
    refreshToken?: string;
    token?: string;
    error?: string;
    user?: User;
  }

  interface User {
    id: string
    name: string
    avatar_url: string
    email: string 
  }
}