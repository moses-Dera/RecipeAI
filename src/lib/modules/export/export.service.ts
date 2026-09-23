import { recipeRepository } from "../recipe/recipe.repository";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export class ExportService {
  async generateDocx(recipeId: number, userId: number | null) {
    const recipe = await recipeRepository.findByIdVisible(recipeId, userId || undefined);
    if (!recipe) throw new Error("NOT_FOUND");

    let ingredientsList: string[] = [];
    try {
      ingredientsList = JSON.parse(recipe.ingredients as string);
    } catch {
      ingredientsList = [recipe.ingredients as string];
    }

    let stepsList: string[] = [];
    try {
      stepsList = JSON.parse(recipe.steps as string);
    } catch {
      stepsList = [recipe.steps as string];
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: recipe.title,
              heading: HeadingLevel.TITLE,
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Preparation Time: ", bold: true }),
                new TextRun(recipe.prep_time_min ? `${recipe.prep_time_min} minutes` : "N/A"),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "Ingredients",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 150 },
            }),
            ...ingredientsList.map(
              (ing: any) => {
                let text = "";
                if (typeof ing === "object" && ing !== null) {
                  const qty = ing.quantity || "";
                  const unit = ing.unit || "";
                  const name = ing.name || "";
                  text = `${qty} ${unit} ${name}`.trim();
                } else {
                  text = String(ing);
                }
                return new Paragraph({
                  text: text,
                  bullet: { level: 0 },
                });
              }
            ),
            new Paragraph({
              text: "Instructions",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 150 },
            }),
            ...stepsList.map(
              (step, index) =>
                new Paragraph({
                  text: `${index + 1}. ${step}`,
                  spacing: { after: 100 },
                })
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}

export const exportService = new ExportService();
