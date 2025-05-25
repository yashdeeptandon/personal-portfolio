import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connection";
import User from "@/models/User";
import { logAuthEvent, logError } from "@/lib/utils/logger";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logAuthEvent("login_attempt", undefined, credentials?.email, {
            error: "Missing credentials",
          });
          throw new Error("Email and password are required");
        }

        logAuthEvent("login_attempt", undefined, credentials.email);

        try {
          await dbConnect();

          // Find user by email and include password field
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user) {
            logAuthEvent("login_failure", undefined, credentials.email, {
              reason: "User not found",
            });
            throw new Error("Invalid email or password");
          }

          // Check if user is active
          if (!user.isActive) {
            logAuthEvent(
              "login_failure",
              user._id.toString(),
              credentials.email,
              {
                reason: "Account deactivated",
              }
            );
            throw new Error("Account is deactivated");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            logAuthEvent(
              "login_failure",
              user._id.toString(),
              credentials.email,
              {
                reason: "Invalid password",
              }
            );
            throw new Error("Invalid email or password");
          }

          // Update last login
          await user.updateLastLogin();

          logAuthEvent(
            "login_success",
            user._id.toString(),
            credentials.email,
            {
              role: user.role,
              lastLogin: user.lastLogin,
            }
          );

          // Return user object (password will be excluded by the model's toJSON transform)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
          };
        } catch (error) {
          logError(error, {
            operation: "authentication",
            email: credentials.email,
          });
          throw new Error(
            error instanceof Error ? error.message : "Authentication failed"
          );
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.isActive = user.isActive;
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/error",
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      logAuthEvent("login_success", user.id, user.email || undefined, {
        provider: account?.provider,
        isNewUser,
        role: (user as any).role,
      });
    },

    async signOut({ token }) {
      logAuthEvent("logout", token?.sub, token?.email as string);
    },

    async createUser({ user }) {
      logAuthEvent("login_success", user.id, user.email || undefined, {
        newUser: true,
        provider: "credentials",
      });
    },
  },

  debug: process.env.NODE_ENV === "development",

  secret: process.env.NEXTAUTH_SECRET,
};

// Type augmentation for NextAuth
declare module "next-auth" {
  interface User {
    role: string;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    isActive: boolean;
  }
}
