import 'dotenv/config';
import { EmbeddingModel, FlagEmbedding } from "fastembed";
import { prisma } from '../lib/db/prisma';

async function main() {
  console.log("Initializing local embedding model (fastembed)...");
  const embeddingModel = await FlagEmbedding.init({ model: EmbeddingModel.BGESmallEN });
  console.log("Fetching recipes without embeddings...");
  
  // Find all recipes that don't have embeddings yet
  const recipes = await prisma.recipe.findMany({
    where: {
      embeddings: {
        none: {}
      }
    },
    include: {
      owner: true
    }
  });

  console.log(`Found ${recipes.length} recipes to process.`);

  for (const recipe of recipes) {
    const textToEmbed = `
Title: ${recipe.title}
Region: ${recipe.region || 'Unknown'}
Meal Type: ${recipe.meal_type || 'Unknown'}
Occasion: ${recipe.occasion || 'Unknown'}
Time: ${recipe.prep_time_min || 0} min prep
Ingredients: ${recipe.ingredients}
Instructions: ${recipe.steps}
    `.trim();

    console.log(`Generating embedding for: ${recipe.title}`);
    
    try {
      // Fastembed returns an async iterator of batches
      const embeddingIterator = embeddingModel.embed([textToEmbed]);
      let vectorObj;
      for await (const batch of embeddingIterator) {
        vectorObj = batch[0]; // Take the first (and only) Float32Array
      }
      
      if (!vectorObj) throw new Error("No embedding generated");
      
      const vectorArray = Array.from(vectorObj);
      const vectorFormatted = `[${vectorArray.join(',')}]`;

      // Insert vector using raw query because Prisma Unsupported types need raw SQL
      await prisma.$executeRaw`
        INSERT INTO "RecipeEmbedding" (recipe_id, content, embedding)
        VALUES (${recipe.recipe_id}, ${textToEmbed}, ${vectorFormatted}::vector)
      `;
      console.log(`Success: ${recipe.title}`);
    } catch (e) {
      console.error(`Failed: ${recipe.title}`, e);
    }
  }

  console.log("Finished generating embeddings.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
