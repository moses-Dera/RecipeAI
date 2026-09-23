import { recipeService } from "@/lib/modules/recipe/recipe.service";
import ExploreGallery from "@/components/explore/ExploreGallery";

export const metadata = {
  title: "Explore Recipes - RecipeAI",
  description: "Browse our complete collection of authentic Nigerian recipes.",
};

export default async function ExplorePage() {
  const { recipes } = await recipeService.getAllRecipes();

  return (
    <div className="min-h-screen bg-bg-primary pt-8 pb-12">
      <div className="container mx-auto px-6 md:px-12">
        <ExploreGallery initialRecipes={recipes} />
      </div>
    </div>
  );
}
