import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ChatMessageProps {
  msg: { role: string; content: string };
}

export const ChatMessage = memo(({ msg }: ChatMessageProps) => {
  return (
    <div className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      <div 
        className={`rounded-2xl p-3 shadow-sm min-w-0 ${
          msg.role === "user" 
            ? "max-w-[85%] bg-brand-primary text-white rounded-br-none" 
            : "max-w-[95%] bg-bg-primary text-text-primary border border-text-secondary/10 rounded-bl-none prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-text-primary prose-a:text-brand-primary prose-headings:text-text-primary prose-th:text-text-primary prose-td:text-text-primary break-words dark:prose-invert"
        }`}
      >
        {msg.role === "user" ? (
          <p className="text-sm leading-relaxed">{msg.content}</p>
        ) : (
          <div className="w-full min-w-0">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={{
                table: ({node, ...props}) => (
                  <div className="w-full overflow-x-auto custom-scrollbar my-4">
                    <table {...props} className="w-full text-left table-auto border-collapse min-w-full" />
                  </div>
                ),
                th: ({node, ...props}) => <th {...props} className="border-b border-text-secondary/20 p-2 font-bold whitespace-nowrap" />,
                td: ({node, ...props}) => <td {...props} className="border-b border-text-secondary/10 p-2" />
              }}
            >
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
