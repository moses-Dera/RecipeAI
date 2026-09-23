import { recipeService } from "@/lib/modules/recipe/recipe.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import RecipeEditor from "@/components/recipe/RecipeEditor";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) return { title: "Recipe Not Found" };
    const recipe = await recipeService.getRecipeById(id);
    return {
      title: `Edit ${recipe.title} - RecipeAI`,
    };
  } catch {
    return { title: "Recipe Not Found - RecipeAI" };
  }
}

export default async function EditRecipePage({ params }: PageProps) {
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  if (isNaN(id)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/?callbackUrl=/recipe/${id}/edit`);
  }

  let recipe;
  try {
    recipe = await recipeService.getRecipeById(id);
  } catch {
    notFound();
  }

  // Ensure only the owner can edit
  if (user.role !== "admin" && (!recipe.owner_id || recipe.owner_id.toString() !== user.id)) {
    redirect(`/recipe/${id}`);
  }

  return <RecipeEditor recipeId={id.toString()} initialData={recipe} />;
}
