import { NextResponse } from "next/server";
import { recipeService } from "@/lib/modules/recipe/recipe.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const result = await recipeService.getRecipesByOwner(parseInt(user.id), page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/recipes/me error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
