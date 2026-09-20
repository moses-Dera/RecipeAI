import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { prisma } from "@/lib/db/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const targetUserId = parseInt((await params).id);
    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Don't allow admin to demote themselves
    if (targetUserId === parseInt(user.id)) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const { role } = await req.json();
    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: targetUserId },
      data: { role },
      select: { user_id: true, username: true, role: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
