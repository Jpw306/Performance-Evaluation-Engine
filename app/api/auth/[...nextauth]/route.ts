/* eslint-disable @typescript-eslint/no-explicit-any */

import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { NextAuthOptions } from 'next-auth';

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo'
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any; token: any })
    {
      if (session.user && token.sub)
      {
        session.user = {
          ...session.user,
          avatarUrl: session.user.image || undefined,
          githubUsername: token.githubUsername,
        };
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, profile, account }: { token: any; profile?: any; account?: any })
    {
      if (account)
        token.accessToken = account.access_token;

      if (profile)
      {
        token.githubUsername = profile.login;
        
        try
        {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              githubUsername: profile.login,
              name: profile.name,
              avatarUrl: profile.avatarUrl,
            }),
          });
          
          if (!response.ok)
            console.error('Failed to create/update user in JWT callback');
        } catch (error)
        {
          console.error('Error in JWT callback:', error);
        }
      }

      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
