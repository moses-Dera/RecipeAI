import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { mailService } from "@/lib/modules/mail/mail.service";
import { RegisterDTO, RegisterSchema } from "./auth.schema";
import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

export class AuthService {
  async registerUser(data: RegisterDTO) {
    const validated = RegisterSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        username: validated.username,
        email: validated.email,
        password: hashedPassword,
      },
      select: {
        user_id: true,
        username: true,
        email: true,
      },
    });

    // Send welcome email asynchronously (don't block the response)
    mailService.sendWelcomeEmail(user.email, user.username).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    return user;
  }
}

export const authService = new AuthService();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing-client-secret",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        
        return {
          id: user.user_id.toString(),
          email: user.email,
          name: user.username,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        // Upsert user based on email
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              username: user.name || "Google User",
              profile_img: user.image || null,
              role: "user",
            }
          });
        }

        // Upsert account
        const dbAccount = await prisma.account.findUnique({
          where: {
            provider_provider_account_id: {
              provider: account.provider,
              provider_account_id: account.providerAccountId
            }
          }
        });

        if (!dbAccount) {
          await prisma.account.create({
            data: {
              user_id: dbUser.user_id,
              provider: account.provider,
              provider_account_id: account.providerAccountId,
              access_token: account.access_token || null,
            }
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // User is available on the first sign in
      if (user) {
        if (account?.provider === "google") {
          // Look up the created/existing user from DB
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email as string }
          });
          if (dbUser) {
            token.id = dbUser.user_id.toString();
            token.role = dbUser.role;
            token.name = dbUser.username;
          }
        } else {
          // Credentials login
          token.id = user.id;
          const dbUser = await prisma.user.findUnique({
            where: { user_id: parseInt(user.id as string) },
            select: { role: true, username: true },
          });
          token.role = dbUser?.role || "user";
          token.name = dbUser?.username || user.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    ...session.user,
    id: (session.user as any).id as string,
    role: ((session.user as any).role || "user") as string,
  };
}
