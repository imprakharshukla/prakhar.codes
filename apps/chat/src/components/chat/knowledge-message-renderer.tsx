import { ChatMessageContent } from "./message-content";
import type { UIMessage } from "@ai-sdk/react";
import type { SourceInfo } from "./types";

interface KnowledgeMessageRendererProps {
  messages: UIMessage[];
  messageSources: Map<string, SourceInfo[]>;
  isLoading: boolean;
}

export function KnowledgeMessageRenderer({
  messages,
  messageSources,
  isLoading,
}: KnowledgeMessageRendererProps) {
  return (
    <>
      {/* Render all messages with their sources */}
      {messages.map((message, messageIndex) => {
        const sources = messageSources.get(message.id) || [];

        return (
          <ChatMessageContent
            key={messageIndex}
            message={message}
            messageIndex={messageIndex}
            sources={sources}
          />
        );
      })}
    </>
  );
}
