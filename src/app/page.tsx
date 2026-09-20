import LandingHero from "@/components/landing/LandingHero";
import TrendingGrid from "@/components/landing/TrendingGrid";
import { recipeService } from "@/lib/modules/recipe/recipe.service";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function LandingPage() {
  const { recipes } = await recipeService.getAllRecipes(1, 12);

  return (
    <div className="flex flex-col gap-16 pb-20">
      <LandingHero />
      <TrendingGrid initialRecipes={recipes} />
    </div>
  );
}
