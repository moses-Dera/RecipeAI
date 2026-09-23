import 'dotenv/config';
import { prisma } from './src/lib/db/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: { user_id: true, email: true, username: true }
  });
  console.log("Users in database:");
  console.table(users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
