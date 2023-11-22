import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import NextAuth, { DefaultSession, NextAuthOptions, Session } from 'next-auth';
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { JWT } from 'next-auth/jwt';

const loginUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve conter no mínimo 6 caracteres'),
});

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@email.com' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials, req) {
        const { email, password } = loginUserSchema.parse(credentials);
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;
        if (user.hashedPassword) {
          const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
          if (!isPasswordValid) return null;
        }

        const avatarUrl = user.avatar_url || '';

        return {
          type: 'credentials',
          provider: 'email',
          ...user,
          avatar_url: avatarUrl,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET as string,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider == 'google') {
        return true
      }
      else {
        if (account && account?.provider) {
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: user.id,
              provider: account.provider,
            },
          });
    
          if (!existingAccount) {
            const expires = new Date();
            expires.setHours(expires.getHours() + 24)
            try {
              // Criação da Session
              const sessionCreated = await prisma.session.create({
                data: {
                  userId: user.id,
                  expires,
                  sessionToken: account.providerAccountId, // Ou utilize um UUID único
                },
              });
    
              // Criação da Account
              const createdAccount = await prisma.account.create({
                data: {
                  userId: user.id,
                  provider: account.provider,
                  type: account.type,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  id_token: account.id_token,
                  refresh_token: account.refresh_token,
                  scope: account.scope,
                  session_state: account.session_state,
                  token_type: account.token_type,
                  providerAccountId: account.providerAccountId,
                },
              });
    
              // Relaciona a Account criada ao User
              const accountRelation = await prisma.user.update({
                where: { id: user.id },
                data: {
                  accounts: {
                    connect: { id: createdAccount.id },
                  },
                },
              });
            } catch (e) {
              console.log('Erro: ', e);
            }
          }
    
          return true;
        }}
      return false
    },
    
    async session({ session, token, user }) {
      if (user) {
        // Encontrar a sessão associada ao usuário
        const userSession = await prisma.session.findFirst({
          where: {
            userId: user.id,
          },
        });
    
        if (userSession) {
          const isSessionExpired = userSession.expires < new Date();
    
          if (isSessionExpired) {
            // Atualiza a sessão com uma nova expiração
            const updatedSession = await prisma.session.update({
              where: { id: userSession.id },
              data: {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Adiciona 24h na data atual
              },
            });
    
            console.log('Sessão atualizada:', updatedSession);
          }
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };