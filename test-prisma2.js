require('ts-node/register/transpile-only');
const { prisma } = require('./src/lib/db/prisma');
async function main() {
  try {
    const data = await prisma.savedRecipe.findMany({
      where: { user_id: 1 },
      include: { recipe: true },
      orderBy: { saved_at: 'desc' }
    });
    console.log("Success, found:", data.length);
  } catch (e) {
    console.error("Prisma error:", e);
  }
  await prisma.$disconnect();
}
main();
