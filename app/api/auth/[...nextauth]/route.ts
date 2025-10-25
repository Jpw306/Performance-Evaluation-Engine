import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.sub) {
        session.user = {
          ...session.user,
          avatar_url: session.user.image || undefined,
          githubUsername: token.githubUsername,
        };
      }
      return session;
    },
    async jwt({ token, profile }: { token: any; profile?: any }) {
      if (profile) {
        token.githubUsername = profile.login;
        
        // Create or update user in database
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              githubUsername: profile.login,
              name: profile.name,
              photoIcon: profile.avatar_url,
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to create/update user in JWT callback');
          }
        } catch (error) {
          console.error('Error in JWT callback:', error);
        }
      }
      return token;
    },
  },
};

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
