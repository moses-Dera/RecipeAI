import { Suspense } from "react";
import { recipeService } from "@/lib/modules/recipe/recipe.service";
import ExploreGallery from "@/components/explore/ExploreGallery";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Explore Recipes - RecipeAI",
  description: "Browse our complete collection of authentic Nigerian recipes.",
};

export default async function ExplorePage() {
  const { recipes } = await recipeService.getAllRecipes();

  return (
    <div className="min-h-screen bg-bg-primary pt-8 pb-12">
      <div className="container mx-auto px-6 md:px-12">
        <Suspense fallback={<div className="text-center py-20 text-text-secondary">Loading recipes...</div>}>
          <ExploreGallery initialRecipes={recipes} />
        </Suspense>
      </div>
    </div>
  );
}
