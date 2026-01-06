import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
} from "@/components/ai-elements/sources";
import type { UIMessage } from "@ai-sdk/react";
import type { SourceInfo } from "./types";

interface MessageContentProps {
  message: UIMessage;
  messageIndex: number;
  sources?: SourceInfo[];
}

export function ChatMessageContent({
  message,
  messageIndex,
  sources = [],
}: MessageContentProps) {
  // Extract text from parts if they exist
  let text = "";

  if (
    (message as any).parts &&
    Array.isArray((message as any).parts)
  ) {
    const textParts = (message as any).parts.filter(
      (p: any) => p.type === "text"
    );
    text = textParts
      ?.map((p: any) => p.text)
      .join("")
      .trim();
  } else if (typeof (message as any).content === "string") {
    text = (message as any).content.trim();
  }

  // Skip text rendering only if there's no text content at all
  if (!text) {
    return null;
  }

  return (
    <Message from={message.role} key={messageIndex}>
      <MessageContent>
        <Response>{text}</Response>
        {sources.length > 0 && (
          <Sources>
            <SourcesTrigger count={sources.length} />
            <SourcesContent>
              {sources.map((source, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <a
                    href={source.href || source.url || "#"}
                    target={source.isExternal ? "_blank" : "_self"}
                    rel={source.isExternal ? "noopener noreferrer" : undefined}
                    className="text-sm font-medium hover:underline"
                  >
                    {source.title}
                  </a>
                  {source.isExternal && source.url && (
                    <span className="text-xs text-muted-foreground truncate">
                      {new URL(source.url).hostname}
                    </span>
                  )}
                </div>
              ))}
            </SourcesContent>
          </Sources>
        )}
      </MessageContent>
    </Message>
  );
}

