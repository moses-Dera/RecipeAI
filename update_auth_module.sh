#!/bin/bash

# Merge authOptions and session into auth.service.ts
cat << 'EOT' > src/lib/modules/auth/auth.service.ts
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
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

    return user;
  }
}

export const authService = new AuthService();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
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
  return session?.user;
}
EOT

# Update imports in controllers and nextauth route
find src/ -type f -name "*.ts" -exec sed -i 's|@/lib/modules/auth/authOptions|@/lib/modules/auth/auth.service|g' {} +
find src/ -type f -name "*.ts" -exec sed -i 's|@/lib/modules/auth/session|@/lib/modules/auth/auth.service|g' {} +

# Delete the isolated files
rm -f src/lib/modules/auth/authOptions.ts src/lib/modules/auth/session.ts

