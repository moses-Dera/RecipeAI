import { recipeController } from "@/lib/modules/recipe/recipe.controller";
export const GET = recipeController.getRecipeById.bind(recipeController);
export const PUT = recipeController.updateRecipe.bind(recipeController);
export const DELETE = recipeController.deleteRecipe.bind(recipeController);
