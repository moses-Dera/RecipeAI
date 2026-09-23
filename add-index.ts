import { Client } from 'pg';
import "dotenv/config";

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    console.log("Altering column to 384 dimensions...");
    await client.query(`
      ALTER TABLE "RecipeEmbedding" 
      ALTER COLUMN embedding TYPE vector(384);
    `);

    console.log("Adding HNSW index to RecipeEmbedding...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS recipe_embedding_hnsw_idx 
      ON "RecipeEmbedding" 
      USING hnsw (embedding vector_cosine_ops);
    `);
    
    console.log("Index added successfully!");
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

main();
