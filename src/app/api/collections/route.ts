import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { collectionService } from "@/lib/modules/collection/collection.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const collections = await collectionService.getUserCollections(parseInt(user.id));
    return NextResponse.json({ collections });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const collection = await collectionService.createCollection(parseInt(user.id), body.name, body.description);
    return NextResponse.json({ collection }, { status: 201 });
  } catch (error: any) {
    if (error.message === "BAD_REQUEST") return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (error.message === "ALREADY_EXISTS") return NextResponse.json({ error: "Collection name already exists" }, { status: 409 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
