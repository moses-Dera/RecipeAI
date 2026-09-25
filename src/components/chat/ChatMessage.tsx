import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  msg: { role: string; content: string };
}

export const ChatMessage = memo(({ msg }: ChatMessageProps) => {
  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <div 
        className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
          msg.role === "user" 
            ? "bg-brand-primary text-white rounded-br-none" 
            : "bg-bg-primary text-text-primary border border-text-secondary/10 rounded-bl-none prose prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-text-primary prose-a:text-brand-primary break-words"
        }`}
      >
        {msg.role === "user" ? (
          <p className="text-sm leading-relaxed">{msg.content}</p>
        ) : (
          <div className="overflow-x-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the content actually changed (crucial for streaming)
  return prevProps.msg.content === nextProps.msg.content && prevProps.msg.role === nextProps.msg.role;
});

ChatMessage.displayName = "ChatMessage";
