import { NextResponse } from "next/server";
import { recipeService } from "@/lib/modules/recipe/recipe.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await recipeService.getAllRecipesAdmin(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
