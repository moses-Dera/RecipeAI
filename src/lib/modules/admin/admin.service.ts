import { prisma } from "@/lib/db/prisma";
import { SystemSettingsDTO } from "./admin.schema";

export class AdminService {
  /**
   * Updates or creates the LLM Provider configuration in the SystemSettings table
   */
  async updateLLMSettings(data: SystemSettingsDTO) {
    // We store each setting as a separate row in the SystemSettings table
    const settings = [
      { key: "LLM_PROVIDER", value: data.provider },
      { key: "LLM_BASE_URL", value: data.baseUrl || "" },
      { key: "LLM_MODEL_NAME", value: data.modelName || "" },
    ];
    
    // Only update API Key if it's not the masked placeholder
    if (data.apiKey !== undefined && data.apiKey !== "********") {
      settings.push({ key: "LLM_API_KEY", value: data.apiKey });
    }

    // Use a transaction to update all settings atomically
    await prisma.$transaction(
      settings.map((setting) =>
        prisma.systemSettings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        })
      )
    );

    return { message: "System settings updated successfully" };
  }

  /**
   * Retrieves the current system settings and formats them as a DTO
   */
  async getSystemSettings(): Promise<SystemSettingsDTO> {
    const settings = await prisma.systemSettings.findMany();
    
    // Convert array of key-value pairs back to object
    const map = settings.reduce((acc: Record<string, string>, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return {
      provider: (map["LLM_PROVIDER"] || "gemini") as any,
      baseUrl: map["LLM_BASE_URL"] || "",
      modelName: map["LLM_MODEL_NAME"] || "",
      apiKey: map["LLM_API_KEY"] ? "********" : "", // Mask API key for security
    };
  }

  /**
   * Retrieves high-level platform statistics for the Admin Dashboard
   */
  async getPlatformMetrics() {
    const totalUsers = await prisma.user.count();
    const totalRecipes = await prisma.recipe.count();
    // Unique chat sessions can be counted via distinct session_id
    const distinctSessions = await prisma.chatHistory.findMany({
      distinct: ['session_id'],
      select: { session_id: true }
    });
    const totalChats = distinctSessions.length;

    return {
      totalUsers,
      totalRecipes,
      totalChats,
    };
  }
}

export const adminService = new AdminService();
