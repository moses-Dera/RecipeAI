import { NextResponse } from "next/server";
import { recipeService } from "@/lib/modules/recipe/recipe.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const user = await getCurrentUser();
    const results = await recipeService.searchRecipes(query, user ? parseInt(user.id) : undefined);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search recipes" }, { status: 500 });
  }
}
