import { recipeRepository } from "../recipe/recipe.repository";

export class ExportService {
  async generateDocx(recipeId: number, userId: number | null) {
    const recipe = await recipeRepository.findByIdVisible(recipeId, userId || undefined);
    if (!recipe) throw new Error("NOT_FOUND");

    // In a real implementation, we would use the 'docx' npm package here.
    // e.g. 
    // const doc = new Document({ sections: [...] });
    // const buffer = await Packer.toBuffer(doc);
    
    // For now, return a mock string buffer that simulates a generated document
    const mockContent = `Recipe: ${recipe.title}\nIngredients: ${JSON.stringify(recipe.ingredients)}`;
    return Buffer.from(mockContent, "utf-8");
  }
}

export const exportService = new ExportService();
