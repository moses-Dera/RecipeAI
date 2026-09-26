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
    }).catch((e: any) => console.error("Async DB save failed for chat history:", e));

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

  async getUserSessions(userId: number, limit = 5) {
    // Get unique sessions for this user, ordered by most recent first
    // Since Prisma doesn't natively support distinct with orderBy on other fields perfectly without complex groupings,
    // we can just fetch the most recent messages for the user and group them in JS, or use a raw query.
    // Let's just fetch the last 50 messages, group by session_id, and take the top `limit`.
    const recentMessages = await prisma.chatHistory.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 100,
      select: { session_id: true, message: true, created_at: true, role: true },
    });

    const sessionsMap = new Map();
    for (const msg of recentMessages) {
      if (!sessionsMap.has(msg.session_id)) {
        sessionsMap.set(msg.session_id, {
          session_id: msg.session_id,
          created_at: msg.created_at,
          preview: msg.role === 'user' ? msg.message : "Chef Ada recipe suggestion",
        });
      } else {
        // If we find a user message, prefer that for the preview instead of Ada's response
        const existing = sessionsMap.get(msg.session_id);
        if (msg.role === 'user' && existing.preview === "Chef Ada recipe suggestion") {
          existing.preview = msg.message;
        }
      }
    }

    return Array.from(sessionsMap.values()).slice(0, limit);
  }
}

export const chatRepository = new ChatRepository();
