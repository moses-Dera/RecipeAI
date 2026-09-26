import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = parseInt(user.id);

    const [totalRecipes, totalSaved, viewCountResult] = await Promise.all([
      prisma.recipe.count({ where: { owner_id: userId } }),
      prisma.savedRecipe.count({ where: { user_id: userId } }),
      prisma.recipe.aggregate({
        _sum: { view_count: true },
        where: { owner_id: userId }
      })
    ]);

    return NextResponse.json({
      totalRecipes,
      totalSaved,
      totalViews: viewCountResult._sum.view_count || 0
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
