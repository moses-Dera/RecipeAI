import LandingHero from "@/components/landing/LandingHero";
import TrendingGrid from "@/components/landing/TrendingGrid";
import { recipeService } from "@/lib/modules/recipe/recipe.service";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  let recipes: any[] = [];
  
  try {
    const result = await recipeService.getTrendingRecipes(12);
    recipes = result.recipes;
  } catch (error) {
    console.error("Failed to load trending recipes (DB may be unreachable):", error instanceof Error ? error.message : error);
  }

  return (
    <div className="flex flex-col gap-16 pb-20">
      <LandingHero />
      <TrendingGrid initialRecipes={recipes} />
    </div>
  );
}
