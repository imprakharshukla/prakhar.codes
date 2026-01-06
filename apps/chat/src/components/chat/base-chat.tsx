import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import type { UIMessage } from "@ai-sdk/react";
import type { ReactNode } from "react";

interface BaseChatProps {
  messages: UIMessage[];
  children: ReactNode;
}

export function BaseChat({ messages, children }: BaseChatProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex flex-1 flex-col min-h-0 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        <Conversation className="flex-1 min-h-0">
          <ConversationContent>{children}</ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>
    </div>
  );
}
