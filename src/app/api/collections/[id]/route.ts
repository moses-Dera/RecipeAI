import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { collectionService } from "@/lib/modules/collection/collection.service";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const collectionId = parseInt((await params).id);
    if (isNaN(collectionId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    
    await collectionService.deleteCollection(parseInt(user.id), collectionId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
