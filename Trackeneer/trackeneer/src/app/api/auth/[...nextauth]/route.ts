import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login', // Redirect users to our custom login page
    error: '/login', // Redirect errors back to login page
  },
  debug: true, // Enable debug mode to see more detailed error messages
  callbacks: {
    async signIn({ user, account, profile }) {
      return true; // Allow all sign-ins for now
    },
    async redirect({ url, baseUrl }) {
      return baseUrl + '/dashboard'; // Always redirect to dashboard after sign-in
    },
  },
})

export { handler as GET, handler as POST }