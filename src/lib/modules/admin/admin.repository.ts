import { prisma } from "@/lib/db/prisma";

export class AdminRepository {
  /**
   * Upsert a setting by key
   */
  async setSetting(key: string, value: string) {
    return prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  /**
   * Get a setting by key
   */
  async getSetting(key: string): Promise<string | null> {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  /**
   * Get multiple settings by keys
   */
  async getSettings(keys: string[]): Promise<Record<string, string>> {
    const settings = await prisma.systemSettings.findMany({
      where: { key: { in: keys } },
    });
    const result: Record<string, string> = {};
    for (const key of keys) {
      const found = settings.find((s) => s.key === key);
      if (found) {
        result[key] = found.value;
      }
    }
    return result;
  }

  /**
   * Get platform metrics
   */
  async getMetrics() {
    const [totalUsers, totalRecipes, totalChats] = await Promise.all([
      prisma.user.count(),
      prisma.recipe.count(),
      prisma.chatHistory.count(),
    ]);

    return { totalUsers, totalRecipes, totalChats };
  }
}

export const adminRepository = new AdminRepository();
