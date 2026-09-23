import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dns from 'dns';

// Fix ENETUNREACH issues with neon/prisma accelerate on Node 20+
dns.setDefaultResultOrder('ipv4first');

const globalForPrisma2 = globalThis as unknown as {
  prisma2: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma2.prisma2 ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma2.prisma2 = prisma;
