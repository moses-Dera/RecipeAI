import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(user.id);

    await prisma.$transaction(async (tx: any) => {
      // 1. Delete private recipes
      await tx.recipe.deleteMany({
        where: { owner_id: userId, is_private: true },
      });

      // 2. Anonymize public recipes (make them platform recipes)
      await tx.recipe.updateMany({
        where: { owner_id: userId, is_private: false },
        data: { owner_id: null },
      });

      // 3. Delete saved recipes, chat history, and accounts
      await tx.savedRecipe.deleteMany({ where: { user_id: userId } });
      await tx.chatHistory.deleteMany({ where: { user_id: userId } });
      await tx.account.deleteMany({ where: { user_id: userId } });

      // 4. Delete the user
      await tx.user.delete({ where: { user_id: userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
