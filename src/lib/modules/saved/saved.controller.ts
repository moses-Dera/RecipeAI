import { NextResponse } from "next/server";
import { savedService } from "./saved.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { z } from "zod";

export class SavedController {
  async getSavedRecipes(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const saved = await savedService.getUserSavedRecipes(parseInt(user.id as string));
      return NextResponse.json({ saved });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
  }

  async saveRecipe(req: Request) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const body = await req.json();
      const saved = await savedService.saveRecipe(parseInt(user.id as string), body);
      return NextResponse.json({ saved }, { status: 201 });
    } catch (error: any) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
      if (error.message === "ALREADY_SAVED") return NextResponse.json({ error: "Recipe is already saved" }, { status: 409 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async unsaveRecipe(req: Request, { params }: { params: Promise<{ saveId: string }> }) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const saveId = parseInt((await params).saveId);
      if (isNaN(saveId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      await savedService.unsaveRecipe(parseInt(user.id as string), saveId);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Saved recipe not found or permission denied" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
export const savedController = new SavedController();
