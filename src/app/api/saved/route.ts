import { savedController } from "@/lib/modules/saved/saved.controller";
export const GET = savedController.getSavedRecipes.bind(savedController);
export const POST = savedController.saveRecipe.bind(savedController);
