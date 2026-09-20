import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export class ChatRepository {
  async saveMessage(data: Prisma.ChatHistoryUncheckedCreateInput) {
    return prisma.chatHistory.create({
      data,
    });
  }

  async getHistory(userId: number, sessionId: string) {
    return prisma.chatHistory.findMany({
      where: {
        user_id: userId,
        session_id: sessionId,
      },
      orderBy: { created_at: 'asc' },
    });
  }
}

export const chatRepository = new ChatRepository();
