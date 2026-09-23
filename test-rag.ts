import { chatService } from "./src/lib/modules/chat/chat.service";
import { ChatMessageDTO } from "./src/lib/modules/chat/chat.schema";

async function testRAG() {
  const data: ChatMessageDTO = {
    message: "Can you recommend a recipe from the catalogue with chicken?",
    session_id: "test-rag-session-" + Date.now(),
    context: {}
  };

  try {
    const stream = await chatService.processMessageStream(undefined, data);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      process.stdout.write(decoder.decode(value, { stream: true }));
    }
    console.log("\n\nDone.");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testRAG();
