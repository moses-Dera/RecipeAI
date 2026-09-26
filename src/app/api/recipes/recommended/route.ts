import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { recipeService } from "@/lib/modules/recipe/recipe.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    // We get 6 trending recipes. We will filter out ones created by the user on the server.
    const { recipes } = await recipeService.getTrendingRecipes(10);
    
    let recommended = recipes;
    if (user?.id) {
      const userId = parseInt(user.id);
      recommended = recipes.filter(r => r.owner_id !== userId);
    }
    
    // Take top 4
    return NextResponse.json({ recipes: recommended.slice(0, 4) });
  } catch (error) {
    console.error("Recommended Recipes Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
