import { prisma } from "@/lib/db/prisma";

export class AdminService {
  /**
   * Returns the current AI config (read-only, from environment)
   */
  async getSystemSettings() {
    // All AI config now comes from .env — read-only display for admins
    const provider = process.env.NVIDIA_API_KEY ? "nvidia" 
      : process.env.OLLAMA_BASE_URL ? "ollama"
      : process.env.OPENAI_API_KEY ? "openai" 
      : "gemini";

    return {
      provider,
      baseUrl: process.env.NVIDIA_BASE_URL || process.env.LLM_BASE_URL || "",
      modelName: process.env.NVIDIA_MODEL_NAME || process.env.LLM_MODEL_NAME || "",
      apiKeyConfigured: !!(process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
    };
  }

  /**
   * Retrieves high-level platform statistics for the Admin Dashboard
   */
  async getPlatformMetrics() {
    const [totalUsers, totalRecipes, distinctSessions] = await Promise.all([
      prisma.user.count(),
      prisma.recipe.count(),
      prisma.chatHistory.findMany({
        distinct: ['session_id'],
        select: { session_id: true }
      }),
    ]);

    return {
      totalUsers,
      totalRecipes,
      totalChats: distinctSessions.length,
    };
  }
}

export const adminService = new AdminService();
