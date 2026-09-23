import { prisma } from './src/lib/db/prisma';
async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
