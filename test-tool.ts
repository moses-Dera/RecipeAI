import "dotenv/config";
import { chatService } from "./src/lib/modules/chat/chat.service";

// Access the non-exported tool by just exporting it in chat.service.ts for a moment, or re-implementing it here.
// Or we can just import the toolsByName if it was exported.
// Let's just run semantic search directly to verify.
import { prisma } from "./src/lib/db/prisma";
import { FlagEmbedding, EmbeddingModel } from "fastembed";

async function testSearch() {
  console.log("Initializing fastembed...");
  const model = await FlagEmbedding.init({ model: EmbeddingModel.BGEBaseEN });
  console.log("Generating embedding...");
  const query = "chicken recipe";
  const embeddingIterator = model.embed([query]);
  let vectorObj;
  for await (const batch of embeddingIterator) {
    vectorObj = batch[0];
  }
  const vectorArray = Array.from(vectorObj as Float32Array);
  const vectorFormatted = `[${vectorArray.join(',')}]`;

  console.log("Searching DB...");
  const matches = await prisma.$queryRaw<any[]>`
    SELECT r.recipe_id, r.title, r.region, r.meal_type, r.prep_time_min
    FROM "Recipe" r
    JOIN "RecipeEmbedding" e ON r.recipe_id = e.recipe_id
    ORDER BY e.embedding <=> ${vectorFormatted}::vector
    LIMIT 3;
  `;
  
  console.log("Matches:", matches);
}

testSearch().catch(console.error).finally(() => prisma.$disconnect());
