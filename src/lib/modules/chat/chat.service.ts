import { recipeService } from "../recipe/recipe.service";
import { chatRepository } from "./chat.repository";
import { ChatMessageDTO, ChatMessageSchema } from "./chat.schema";
import { getAIModel } from "../../llm/provider";
import { recipeRepository } from "../recipe/recipe.repository";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

const CHEF_ADA_PROMPT = `You are Chef Ada, a warm, knowledgeable, and passionate expert in traditional Nigerian cuisine.
Your goal is to help users discover, learn, and master Nigerian dishes like Jollof Rice, Egusi Soup, Suya, and more.
Always be encouraging, use a friendly tone, and provide clear, structured recipes or advice.
If a user asks for a recipe, provide a clear list of ingredients and step-by-step instructions.`;

export class ChatService {
  async getChatHistory(userId: number, sessionId: string) {
    return chatRepository.getHistory(userId, sessionId);
  }

  async processMessage(userId: number | undefined, data: ChatMessageDTO) {
    const validated = ChatMessageSchema.parse(data);

    // Save user message to database only if authenticated
    if (userId) {
      await chatRepository.saveMessage({
        user_id: userId,
        role: 'user',
        message: validated.message,
        session_id: validated.session_id,
      });
    }

    // Fetch full conversation history for context (DB if auth, ephemeral if guest)
    let history: { role: string; message: string }[] = [];
    if (userId) {
      history = await this.getChatHistory(userId, validated.session_id);
    } else if (validated.ephemeral_history) {
      history = validated.ephemeral_history.map(msg => ({
        role: msg.role,
        message: msg.content
      }));
      // Append the current message since it's not saved to DB
      history.push({ role: 'user', message: validated.message });
    } else {
      history = [{ role: 'user', message: validated.message }];
    }

    // RAG Grounding: Fetch visible recipes to give Ada actual knowledge
    const { recipes } = await recipeService.getAllRecipes(1, 10);
    const catalogueContext = recipes.map((r: any) => `- ${r.title}: ${r.region || 'Unknown Region'}, Prep: ${r.prep_time_min} mins`).join("\n");

    const systemPromptWithRAG = `${CHEF_ADA_PROMPT}

Here is the live catalogue of recipes currently available in the database:
${catalogueContext}

Important Rules:
1. ONLY recommend dishes that are explicitly listed in the catalogue above.
2. If a user asks for a recipe that is NOT in the catalogue, politely explain that you don't have that specific recipe in the system yet, but offer something similar from the catalogue.
`;

    // Map history to LangChain message types
    const messages = [
      new SystemMessage(systemPromptWithRAG),
      ...history.map(msg => 
        msg.role === 'user' ? new HumanMessage(msg.message) : new AIMessage(msg.message)
      )
    ];

    try {
      // Get the dynamically configured AI model
      const model = await getAIModel();

      // Invoke the model with the conversation history
      const response = await model.invoke(messages);
      const aiResponseText = response.content.toString();

      // Save AI response to database if authenticated
      if (userId) {
        return await chatRepository.saveMessage({
          user_id: userId,
          role: 'assistant',
          message: aiResponseText,
          session_id: validated.session_id,
        });
      } else {
        // Return ephemeral response for guests
        return {
          role: 'assistant',
          message: aiResponseText,
          session_id: validated.session_id,
        };
      }

    } catch (error: any) {
      console.error("AI Model Error:", error);
      // Fallback message if AI fails
      const errorMsg = "I'm sorry, I'm having trouble thinking right now. Please check my AI Provider settings in the Admin panel or ensure your API key is correct.";
      
      if (userId) {
        return await chatRepository.saveMessage({
          user_id: userId,
          role: 'assistant',
          message: errorMsg,
          session_id: validated.session_id,
        });
      } else {
        return {
          role: 'assistant',
          message: errorMsg,
          session_id: validated.session_id,
        };
      }
    }
  }
}

export const chatService = new ChatService();
