import { NextResponse } from "next/server";
import { chatService } from "./chat.service";
import { getCurrentUser } from "@/lib/modules/auth/auth.service";
import { z } from "zod";

export class ChatController {
  async getChatHistory(req: Request) {
    try {
      const user = await getCurrentUser();
      const userId = user?.id ? parseInt(user.id as string) : undefined;

      const url = new URL(req.url);
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
      
      const history = await chatService.getChatHistory(userId, sessionId);
      return NextResponse.json({ history });
    } catch (error: any) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  async processMessage(req: Request) {
    try {
      const user = await getCurrentUser();
      const userId = user?.id ? parseInt(user.id as string) : undefined;
      const body = await req.json();
      
      const stream = await chatService.processMessageStream(userId, body);
      
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache, no-transform',
        }
      });
    } catch (error: any) {
      console.error("[CHAT CONTROLLER ERROR]", error);
      if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
      return NextResponse.json({ error: "Internal Server Error", details: error?.message || "Unknown" }, { status: 500 });
    }
  }
}
export const chatController = new ChatController();
