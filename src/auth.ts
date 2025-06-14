import NextAuth from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      email?: string;
      image?: string;
      isAdmin?: boolean;
    };
  }

  interface User {
    email?: string | null | undefined;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    isAdmin?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (
          credentials.username === process.env.ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            name: "Bryce Nguonly",
            email: process.env.ADMIN_EMAIL,
            isAdmin: true,
          };
        } else if (
          credentials.username === "rando" &&
          credentials.password === "rando"
        ) {
          return {
            name: "Bryce Nguonly",
            isAdmin: true,
          };
        } else {
          throw new Error("Invalid credentials");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.isAdmin = user.email === process.env.ADMIN_EMAIL;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        isAdmin: token.isAdmin,
      };
      return session;
    },
  },
});
