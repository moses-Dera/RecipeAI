import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { chatService } from "@/lib/modules/chat/chat.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = parseInt(user.id);
    const sessions = await chatService.getUserSessions(userId, 5);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Chat History Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
