import { chatController } from "@/lib/modules/chat/chat.controller";
export const GET = chatController.getChatHistory.bind(chatController);
export const POST = chatController.processMessage.bind(chatController);
