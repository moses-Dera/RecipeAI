import { recipeController } from "@/lib/modules/recipe/recipe.controller";
export const GET = recipeController.getRecipes.bind(recipeController);
export const POST = recipeController.createRecipe.bind(recipeController);
