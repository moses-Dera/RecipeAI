import { recipeController } from "@/lib/modules/recipe/recipe.controller";
export const POST = recipeController.publishRecipe.bind(recipeController);
