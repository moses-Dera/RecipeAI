import { prisma } from "@/lib/db/prisma";

export class SavedRepository {
  async getSavedRecipes(userId: number) {
    return prisma.savedRecipe.findMany({
      where: { user_id: userId },
      include: { recipe: true },
      orderBy: { saved_at: "desc" },
    });
  }

  async saveRecipe(userId: number, recipeId: number, notes?: string, collectionId?: number) {
    return prisma.savedRecipe.create({
      data: {
        user_id: userId,
        recipe_id: recipeId,
        collection_id: collectionId,
        notes,
      },
    });
  }

  async removeSavedRecipe(userId: number, saveId: number) {
    return prisma.savedRecipe.deleteMany({
      where: {
        save_id: saveId,
        user_id: userId,
      },
    });
  }
}

export const savedRepository = new SavedRepository();
