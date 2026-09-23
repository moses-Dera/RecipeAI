import { recipeRepository } from "./recipe.repository";
import { CreateRecipeDTO, CreateRecipeSchema, UpdateRecipeDTO, UpdateRecipeSchema } from "./recipe.schema";

export class RecipeService {
  async getAllRecipes(userId?: number, page = 1, limit = 12) {
    return recipeRepository.findAllVisible(userId, page, limit);
  }

  async getRecipesByOwner(ownerId: number, page = 1, limit = 12) {
    return recipeRepository.findByOwner(ownerId, page, limit);
  }

  async getTrendingRecipes(limit = 12) {
    return recipeRepository.findTrending(limit);
  }

  async incrementViewCount(id: number) {
    try {
      await recipeRepository.incrementViewCount(id);
    } catch (error) {
      // Ignore errors (e.g. if recipe doesn't exist) so it doesn't break the page load
    }
  }

  async getRecipeById(id: number, userId?: number) {
    const recipe = await recipeRepository.findByIdVisible(id, userId);
    if (!recipe) {
      throw new Error("NOT_FOUND");
    }
    return recipe;
  }

  async createRecipe(data: CreateRecipeDTO, userId: number) {
    const validated = CreateRecipeSchema.parse(data);
    return recipeRepository.create({
      ...validated,
      owner_id: userId,
    });
  }

  /**
   * Update a recipe. Only the owner or an admin can update.
   */
  async updateRecipe(id: number, data: UpdateRecipeDTO, userId: number, userRole: string) {
    const validated = UpdateRecipeSchema.parse(data);
    
    // Check ownership
    const recipe = await recipeRepository.findOwnerById(id);
    if (!recipe) throw new Error("NOT_FOUND");
    
    const isOwner = recipe.owner_id === userId;
    const isAdmin = userRole === "admin";
    
    if (!isOwner && !isAdmin) {
      throw new Error("NOT_FOUND"); // 404, not 403, to avoid leaking existence
    }

    return recipeRepository.update(id, validated);
  }

  /**
   * Delete a recipe. Only the owner or an admin can delete.
   */
  async deleteRecipe(id: number, userId: number, userRole: string) {
    const recipe = await recipeRepository.findOwnerById(id);
    if (!recipe) throw new Error("NOT_FOUND");
    
    const isOwner = recipe.owner_id === userId;
    const isAdmin = userRole === "admin";
    
    if (!isOwner && !isAdmin) {
      throw new Error("NOT_FOUND");
    }

    return recipeRepository.delete(id);
  }

  /**
   * Admin-only: get all recipes unfiltered
   */
  async getAllRecipesAdmin(page = 1, limit = 20) {
    return recipeRepository.findAll(page, limit);
  }

  async publishRecipe(id: number, userId: number) {
    const result = await recipeRepository.setPublishStatus(id, userId, false);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return { success: true };
  }

  async unpublishRecipe(id: number, userId: number) {
    const result = await recipeRepository.setPublishStatus(id, userId, true);
    if (result.count === 0) throw new Error("NOT_FOUND");
    return { success: true };
  }
}

export const recipeService = new RecipeService();
