import { recipeService } from "../recipe/recipe.service";
import { chatRepository } from "./chat.repository";
import { ChatMessageDTO, ChatMessageSchema } from "./chat.schema";
import { getAIModel } from "../../llm/provider";
import { recipeRepository } from "../recipe/recipe.repository";
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { EmbeddingModel, FlagEmbedding } from "fastembed";
import { prisma } from "@/lib/db/prisma";

const CHEF_ADA_PROMPT = `You are Chef Ada, a professional culinary AI assistant built into the RecipeAI app.
Your goal is to help the user with recipes, cooking techniques, and meal planning.

1. ALWAYS use your built-in search tool to find recipes in the user's RecipeAI catalogue FIRST when they ask for recipe ideas, meal plans, or "what to cook". You should prioritize suggesting recipes they have already saved.
2. Even if the user asks for your personal opinion (e.g. "what is your favorite food?"), search their database first to see if you can pick one of THEIR saved recipes as your favorite!
3. You ALSO have extensive general knowledge. If the database search returns no matches, OR if the user asks a general question, you are fully allowed to provide recipes from your own training data. DO NOT apologize or say you don't have it in your catalogue—simply provide the information using your general knowledge!
4. You have full spatial awareness of the app. If a [PAGE CONTEXT] is provided below, it tells you exactly what page or URL the user is currently viewing. You are fully authorized and encouraged to tell the user what page they are on if they ask!
5. Be friendly, concise, and helpful. Always format your recipes beautifully using markdown.
6. NEVER expose internal database IDs, raw JSON, HTML tags, or technical metadata to the user. Present recipe information in a clean, human-friendly format. Use recipe names, not IDs. If you need to link to a recipe, use the format [Recipe Name](/recipe/ID) as a clickable link.
7. When presenting recipe results, format them beautifully with headers, bullet points, and emojis. Do NOT dump raw ingredient lists or step data.`;

const exportRecipeTool = tool(
  async ({ recipeId }: { recipeId: number }) => {
    return `Tell the user to click the following link to download the recipe document: [Download Recipe](/api/export/${recipeId})`;
  },
  {
    name: "export_recipe",
    description: "Generates an export link for a recipe. Use this when the user explicitly asks to export, download, or save a recipe as a document.",
    schema: z.object({
      recipeId: z.number().describe("The ID of the recipe to export")
    })
  }
);



// We can instantiate it lazily or globally. Globally is better for performance so it stays loaded.
let embeddingModel: FlagEmbedding | null = null;
const getEmbeddingModel = async () => {
  if (!embeddingModel) {
    embeddingModel = await FlagEmbedding.init({ 
      model: EmbeddingModel.BGESmallEN,
      cacheDir: "/tmp"
    });
  }
  return embeddingModel;
};

const searchRecipesTool = tool(
  async ({ query }: { query: string }) => {
    try {
      const model = await getEmbeddingModel();
      const embeddingIterator = model.embed([query]);
      let vectorObj;
      for await (const batch of embeddingIterator) {
        vectorObj = batch[0];
      }
      if (!vectorObj) throw new Error("No embedding generated");
      const vectorArray = Array.from(vectorObj);
      const vectorFormatted = `[${vectorArray.join(',')}]`;

      // Perform cosine similarity search (using <=> operator)
      const matches = await prisma.$queryRaw<any[]>`
        SELECT r.recipe_id, r.title, r.region, r.meal_type, r.prep_time_min, r.ingredients, r.steps
        FROM "Recipe" r
        JOIN "RecipeEmbedding" e ON r.recipe_id = e.recipe_id
        ORDER BY e.embedding <=> ${vectorFormatted}::vector
        LIMIT 3;
      `;

      if (!matches || matches.length === 0) {
        return `No semantically related recipes found for "${query}" in the catalogue. Please answer the user's request using your extensive general culinary knowledge instead.`;
      }

      // Strip HTML tags from recipe data to prevent raw HTML appearing in chat
      const stripHtml = (str: string) => str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      // Parse JSON ingredient arrays into clean text
      const formatIngredients = (raw: string) => {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((ing: any) => `${ing.name} (${ing.quantity} ${ing.unit || ''})`).join(', ');
          }
        } catch {}
        return stripHtml(raw);
      };

      const formatSteps = (raw: string) => {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((step: string, i: number) => `Step ${i + 1}: ${step}`).join('\n');
          }
        } catch {}
        return stripHtml(raw);
      };
      
      return `Found related recipes in the user's catalogue (INTERNAL NOTE: use [Recipe Name](/recipe/ID) format for links, NEVER show raw IDs to user):\n` + matches.map((r: any) => 
        `--- ${r.title} [internal-link: /recipe/${r.recipe_id}] ---\nRegion: ${r.region || 'Unknown'}\nMeal Type: ${r.meal_type || 'Unknown'}\nPrep Time: ${r.prep_time_min || '?'} mins\nIngredients: ${formatIngredients(r.ingredients)}\nSteps: ${formatSteps(r.steps)}\n`
      ).join("\n");
    } catch (e) {
      console.error("Semantic search failed:", e);
      return `Search failed. Please answer the user's request using your extensive general culinary knowledge instead.`;
    }
  },
  {
    name: "search_recipes",
    description: "Search the user's RecipeAI catalogue for recipes. ALWAYS use this tool ANYTIME the user asks about their saved recipes, what to cook, or what recipes they have. If they don't specify an ingredient, use a generic query like 'delicious meals' or 'dinner'.",
    schema: z.object({
      query: z.string().describe("The semantic search query (e.g., 'chicken', 'dinner', 'Italian', or 'delicious meals')")
    })
  }
);

const tools = [exportRecipeTool, searchRecipesTool];
const toolsByName = {
  export_recipe: exportRecipeTool,
  search_recipes: searchRecipesTool
};

export class ChatService {
  async getChatHistory(userId: number | undefined, sessionId: string) {
    return chatRepository.getHistory(sessionId, userId);
  }

  async processMessageStream(userId: number | undefined, data: ChatMessageDTO) {
    const validated = ChatMessageSchema.parse(data);

    // Fetch full conversation history and RAG context concurrently, with fail-safes for slow DB
    let historyRecords: any[] = [];

    try {
      // Always fetch history reliably
      historyRecords = await this.getChatHistory(userId, validated.session_id).catch(() => []);
    } catch (e) {
      console.warn("History fetch skipped due to error:", e);
    }

    const history: { role: string; message: string }[] = historyRecords.map((msg: any) => ({
      role: msg.role,
      message: msg.message
    }));

    // Append the current message
    history.push({ role: 'user', message: validated.message });

    // Save user message to database (fire and forget so we don't block)
    chatRepository.saveMessage({
      user_id: userId || null,
      role: 'user',
      message: validated.message,
      session_id: validated.session_id,
    }).catch(e => console.error("Failed to save user message:", e));

    let systemPromptWithRAG = CHEF_ADA_PROMPT;

    // Page Content Awareness
    if (validated.context?.currentPath) {
      const path = validated.context.currentPath;
      systemPromptWithRAG += `\n\n[PAGE CONTEXT]: The user is currently on the path: "${path}". `;
      
      const match = path.match(/\/recipe\/(\d+)/);
      if (match) {
        const recipeId = parseInt(match[1]);
        try {
          const currentRecipe = await recipeRepository.findByIdVisible(recipeId, userId || undefined);
          if (currentRecipe) {
            systemPromptWithRAG += `Specifically, they are viewing the recipe "${currentRecipe.title}" (ID: ${currentRecipe.recipe_id}). This is EXTREMELY IMPORTANT: If they ask questions about "this recipe", "it", or refer to the current context, you MUST refer to this recipe. Ingredients: ${currentRecipe.ingredients}. Steps: ${currentRecipe.steps}.`;
          }
        } catch (e) {
          // Ignore if not found
        }
      } else if (path.includes("/explore")) {
        systemPromptWithRAG += `They are browsing the Explore page looking for recipes.`;
      } else if (path.includes("/dashboard")) {
        systemPromptWithRAG += `They are on their private Dashboard viewing their saved recipes.`;
      }
    }

    // Map history to LangChain message types
    const messages: any[] = [
      new SystemMessage(systemPromptWithRAG),
      ...history.map(msg => 
        msg.role === 'user' ? new HumanMessage(msg.message) : new AIMessage(msg.message)
      )
    ];

    const encoder = new TextEncoder();
    
    // Return a standard web stream
    return new ReadableStream({
      async start(controller) {
        try {
          const baseModel = await getAIModel();
          // Bind tools
          const modelWithTools = typeof baseModel.bindTools === 'function' 
            ? baseModel.bindTools(tools) 
            : baseModel;
          
          let fullResponseText = "";
          let finalToolCalls: any[] = [];
          let iterations = 0;
          let isToolCall = false;

          // Helper to consume a stream and enqueue chunks
          const consumeStream = async (stream: any) => {
             isToolCall = false;
             fullResponseText = "";
             finalToolCalls = [];
             for await (const chunk of stream) {
                if (chunk.tool_calls && chunk.tool_calls.length > 0) {
                   isToolCall = true;
                   finalToolCalls = chunk.tool_calls;
                } else if (!isToolCall && chunk.content) {
                   const textChunk = chunk.content.toString();
                   fullResponseText += textChunk;
                   controller.enqueue(encoder.encode(textChunk));
                }
             }
          };

          let responseStream = await modelWithTools.stream(messages);
          await consumeStream(responseStream);

          while (isToolCall && iterations < 2) {
             const toolMessage = new AIMessage({ content: "", tool_calls: finalToolCalls });
             messages.push(toolMessage);

             for (const toolCall of finalToolCalls) {
               const selectedTool = toolsByName[toolCall.name as keyof typeof toolsByName];
               if (selectedTool) {
                 const toolResult = await (selectedTool as any).invoke(toolCall.args);
                 messages.push(new ToolMessage({ tool_call_id: toolCall.id!, content: toolResult }));
               } else {
                 messages.push(new ToolMessage({ tool_call_id: toolCall.id!, content: "Tool not found." }));
               }
             }

             // Restart the stream for the final answer
             responseStream = await modelWithTools.stream(messages);
             await consumeStream(responseStream);
             iterations++;
          }

          // Save AI response to database universally (with fail-safe to prevent stream crash)
          await chatRepository.saveMessage({
            user_id: userId || null,
            role: 'assistant',
            message: fullResponseText,
            session_id: validated.session_id,
          }).catch(e => console.error("Failed to save AI message:", e));

          controller.close();
        } catch (error: any) {
          console.error("AI Model Stream Error:", error?.message || error);
          const errorMsg = "\n\nI'm sorry, I'm having a little trouble connecting right now. Please try again in a moment.";
          controller.enqueue(encoder.encode(errorMsg));
          
          await chatRepository.saveMessage({
            user_id: userId || null,
            role: 'assistant',
            message: errorMsg,
            session_id: validated.session_id,
          }).catch(e => console.error("Failed to save AI error message:", e));
          
          controller.close();
        }
      }
    });
  }
}

export const chatService = new ChatService();
