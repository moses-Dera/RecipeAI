import { recipeService } from "@/lib/modules/recipe/recipe.service";
import RecipeDetailView from "@/components/recipe/RecipeDetailView";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return { title: "Recipe Not Found" };
    const recipe = await recipeService.getRecipeById(id);
    return {
      title: `${recipe.title} - RecipeAI`,
      description: `Learn how to cook ${recipe.title}. ${recipe.region ? `A traditional ${recipe.region} recipe.` : ""}`,
    };
  } catch {
    return { title: "Recipe Not Found - RecipeAI" };
  }
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  let recipe;
  try {
    recipe = await recipeService.getRecipeById(id);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <RecipeDetailView recipe={recipe} />
    </main>
  );
}
