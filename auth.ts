import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      login?: string
      id?: string
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      issuer: "https://github.com/login/oauth",
      authorization: {
        params: { scope: "read:user user:email" },
      },
      checks: ["state"],
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 在登入時將 access_token 存入 token 中
      if (account) {
        token.accessToken = account.access_token
        token.login = profile?.login
        token.id = profile?.id // Capture GitHub user ID
      }
      return token
    },
    async session({ session, token }) {
      // 將 token 中的 accessToken 放入 session，以供後端操作使用
      session.accessToken = token.accessToken as string
      if (session.user) {
        session.user.login = token.login as string
        session.user.id = (token.id as string) || (token.sub as string)
      }
      return session
    },
  },
})
