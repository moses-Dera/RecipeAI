import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

/**
 * Master visibility filter: Recipe is either public (is_private=false) or owned by the currentUser.
 * Used on every read path to enforce data isolation (OWASP BOLA prevention).
 */
export const recipeVisibilityFilter = (userId?: number): Prisma.RecipeWhereInput => ({
  OR: [
    { is_private: false },
    ...(userId ? [{ owner_id: userId }] : []),
  ],
});

export class RecipeRepository {
  /**
   * Find all visible recipes with pagination
   */
  async findAllVisible(userId?: number, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const where = recipeVisibilityFilter(userId);

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy: { created_at: "desc" },
        include: { owner: { select: { username: true } } },
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      recipes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find recipe by ID (visibility-checked)
   */
  async findByIdVisible(id: number, userId?: number) {
    return prisma.recipe.findFirst({
      where: {
        recipe_id: id,
        AND: recipeVisibilityFilter(userId),
      },
      include: { owner: { select: { username: true } } },
    });
  }

  /**
   * Find all recipes owned by a specific user (for dashboard "Your Recipe Book")
   */
  async findByOwner(ownerId: number, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const where = { owner_id: ownerId };

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return { recipes, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Admin-only: find ALL recipes unfiltered
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        orderBy: { created_at: "desc" },
        include: { owner: { select: { username: true, user_id: true } } },
        skip,
        take: limit,
      }),
      prisma.recipe.count(),
    ]);

    return { recipes, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Create a new recipe
   */
  async create(data: Prisma.RecipeUncheckedCreateInput) {
    return prisma.recipe.create({ data });
  }

  /**
   * Update a recipe — ownership or admin check must happen in the service layer
   */
  async update(id: number, data: Prisma.RecipeUpdateInput) {
    return prisma.recipe.update({
      where: { recipe_id: id },
      data,
    });
  }

  /**
   * Delete a recipe — ownership or admin check must happen in the service layer
   */
  async delete(id: number) {
    // Cascade: delete related SavedRecipe entries first
    await prisma.savedRecipe.deleteMany({ where: { recipe_id: id } });
    return prisma.recipe.delete({ where: { recipe_id: id } });
  }

  /**
   * Check if a recipe exists and return its owner_id for permission checks
   */
  async findOwnerById(id: number) {
    return prisma.recipe.findUnique({
      where: { recipe_id: id },
      select: { recipe_id: true, owner_id: true },
    });
  }

  /**
   * Set publish status (owner only)
   */
  async setPublishStatus(id: number, ownerId: number, isPrivate: boolean) {
    return prisma.recipe.updateMany({
      where: { recipe_id: id, owner_id: ownerId },
      data: { is_private: isPrivate },
    });
  }
}

export const recipeRepository = new RecipeRepository();
