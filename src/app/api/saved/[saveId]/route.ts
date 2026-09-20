import { savedController } from "@/lib/modules/saved/saved.controller";
export const DELETE = savedController.unsaveRecipe.bind(savedController);
