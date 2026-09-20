import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { adminRepository } from "../modules/admin/admin.repository";

/**
 * Factory function to retrieve the correct LangChain model instance
 * based on the dynamic settings configured in the Admin Panel.
 */
export async function getAIModel(): Promise<BaseChatModel> {
  const keys = ["LLM_PROVIDER", "LLM_BASE_URL", "LLM_MODEL_NAME", "LLM_API_KEY"];
  const settings = await adminRepository.getSettings(keys);

  const provider = settings["LLM_PROVIDER"] || "gemini";
  const baseUrl = settings["LLM_BASE_URL"] || "";
  const modelName = settings["LLM_MODEL_NAME"] || "";
  const apiKey = settings["LLM_API_KEY"] || "";

  if (provider === "ollama") {
    return new ChatOllama({
      baseUrl: baseUrl || "http://localhost:11434",
      model: modelName || "llama3",
    });
  }

  if (provider === "nvidia" || provider === "custom") {
    // NVIDIA NIMs and most custom endpoints are OpenAI-compatible
    return new ChatOpenAI({
      configuration: {
        baseURL: baseUrl,
      },
      apiKey: apiKey,
      modelName: modelName,
    });
  }

  // Default to Gemini or standard OpenAI if specified
  return new ChatOpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY,
    modelName: modelName || "gpt-4o",
    configuration: baseUrl ? { baseURL: baseUrl } : undefined,
  });
}
