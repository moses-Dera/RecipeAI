import { prisma } from "@/lib/db/prisma";
import { Prisma, ChatHistory } from "@prisma/client";
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

export class ChatRepository {
  async saveMessage(data: Prisma.ChatHistoryUncheckedCreateInput) {
    const key = `chat_${data.session_id}`;
    
    // 1. Create a temporary record for immediate cache update
    const tempRecord: ChatHistory = {
      chat_id: Math.floor(Math.random() * 1000000), // temp ID
      user_id: data.user_id as number | null,
      session_id: data.session_id,
      role: data.role,
      message: data.message,
      created_at: new Date(),
    };

    // 2. Instantly update the Redis cache so subsequent reads are blazing fast
    try {
      const existing = await redis.get<ChatHistory[]>(key) || [];
      await redis.set(key, [...existing, tempRecord], { ex: 60 * 60 * 24 }); // 24 hours
    } catch (e) {
      console.warn("Failed to instantly cache message:", e);
    }
    
    // 3. Save to DB asynchronously (fire and forget) to prevent blocking the stream if connection drops
    prisma.chatHistory.create({
      data,
    }).catch(e => console.error("Async DB save failed for chat history:", e));

    return tempRecord;
  }

  async getHistory(sessionId: string, userId?: number) {
    const key = `chat_${sessionId}`;
    
    try {
      // Check fast Upstash cache first
      const cached = await redis.get<ChatHistory[]>(key);
      if (cached && cached.length > 0) {
        return cached;
      }
    } catch (e) {
      console.error("Redis fetch failed, falling back to DB", e);
    }

    // Fallback to database
    const history = await prisma.chatHistory.findMany({
      where: {
        session_id: sessionId,
      },
      orderBy: { created_at: 'asc' },
    });
    
    if (history.length > 0) {
      // Background cache fill
      redis.set(key, history, { ex: 60 * 60 * 24 }).catch(console.error);
    }

    return history;
  }
}

export const chatRepository = new ChatRepository();
