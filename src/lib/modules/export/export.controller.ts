import { NextResponse } from "next/server";
import { exportService } from "./export.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";

export class ExportController {
  async downloadRecipe(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getCurrentUser();
      if (!user?.id) return NextResponse.json({ error: "Registered account required to export recipes" }, { status: 401 });
      const recipeId = parseInt((await params).id);
      if (isNaN(recipeId)) return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
      const buffer = await exportService.generateDocx(recipeId, parseInt(user.id as string));
      return new NextResponse(buffer as any, {
        headers: {
          "Content-Disposition": `attachment; filename="recipe-${recipeId}.docx"`,
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      });
    } catch (error: any) {
      if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
export const exportController = new ExportController();
