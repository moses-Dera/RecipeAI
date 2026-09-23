import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * Factory function to retrieve the correct LangChain model instance.
 * ALL configuration comes from environment variables only.
 */
export async function getAIModel(): Promise<BaseChatModel> {
  // Everything from .env — no DB lookups
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "";
  const baseUrl = process.env.NVIDIA_BASE_URL || process.env.LLM_BASE_URL || "";
  const modelName = process.env.NVIDIA_MODEL_NAME || process.env.LLM_MODEL_NAME || "";
  
  // Auto-detect provider from which env key is present
  let provider = "gemini";
  if (process.env.NVIDIA_API_KEY) provider = "nvidia";
  else if (process.env.OLLAMA_BASE_URL) provider = "ollama";
  else if (process.env.OPENAI_API_KEY) provider = "openai";

  if (provider === "ollama") {
    return new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: modelName || "llama3",
      temperature: 0.2,
    });
  }

  if (provider === "nvidia") {
    return new ChatOpenAI({
      configuration: {
        baseURL: baseUrl || "https://integrate.api.nvidia.com/v1",
      },
      apiKey: apiKey,
      modelName: modelName || "nvidia/nemotron-3.5-lightning-30b-a3b",
      temperature: 0.2,
    });
  }

  // Default: OpenAI-compatible (works for Gemini, OpenAI, custom)
  return new ChatOpenAI({
    apiKey: apiKey,
    modelName: modelName || "gpt-4o",
    configuration: baseUrl ? { baseURL: baseUrl } : undefined,
    temperature: 0.2,
  });
}
