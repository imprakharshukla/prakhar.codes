"use client";

import { useState, useEffect, useRef } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import type { ChatStatus } from "ai";
import { DefaultChatTransport } from "ai";
import { useKnowledgeExtraction } from "@/hooks/use-knowledge-extraction";
import { BaseChat } from "./base-chat";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatPromptInput } from "./chat-prompt-input";
import { KnowledgeMessageRenderer } from "./knowledge-message-renderer";
import { AnimatedLoadingText } from "@/components/ui/animated-loading-text";
import { usePostHog } from "posthog-js/react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

interface KnowledgeChatProps {
  initialMessages?: UIMessage[];
  readOnly?: boolean;
  apiEndpoint?: string;
}

export function KnowledgeChat({
  initialMessages = [],
  readOnly = false,
  apiEndpoint = "/api/chat",
}: KnowledgeChatProps) {
  const posthog = usePostHog();
  const isFirstUserMessage = useRef(true);
  const emptyStateTextareaRef = useRef<HTMLTextAreaElement>(null);
  const chatStateTextareaRef = useRef<HTMLTextAreaElement>(null);
  const prevDisabledRef = useRef<boolean | null>(null);

  const [input, setInput] = useState("");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({
      api: apiEndpoint,
      body: {},
    }),
    onFinish: async (message) => {
      setActiveTool(null);

      if (isFirstUserMessage.current && message.message.role === "assistant") {
        isFirstUserMessage.current = false;
      }

      knowledgeExtraction.extractFromFinishedMessage(message.message);

      // Fetch suggestions after assistant message completes
      if (message.message.role === "assistant") {
        const updatedMessages = [...messages, message.message];
        fetchSuggestions(updatedMessages);
      }
    },
    onError: (error: Error) => {
      console.error("Chat error:", error);
    },
  });

  const knowledgeExtraction = useKnowledgeExtraction({
    messages,
  });

  // Initialize messages from initialMessages prop
  useEffect(() => {
    if (
      initialMessages &&
      initialMessages.length > 0 &&
      messages.length === 0
    ) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages, messages.length]);

  const isLoading = status === "submitted" || status === "streaming";
  const isEmptyState = messages.length === 0;

  // Auto-focus textarea when disabled changes from true to false
  useEffect(() => {
    const isNowDisabled = isLoading;

    if (
      prevDisabledRef.current !== null &&
      prevDisabledRef.current &&
      !isNowDisabled
    ) {
      setTimeout(() => {
        if (isEmptyState && emptyStateTextareaRef.current) {
          emptyStateTextareaRef.current.focus();
        } else if (!isEmptyState && chatStateTextareaRef.current) {
          chatStateTextareaRef.current.focus();
        }
      }, 100);
    }

    prevDisabledRef.current = isNowDisabled;
  }, [isLoading, isEmptyState]);

  // Detect active tool calls from streaming messages
  useEffect(() => {
    if (!isLoading) {
      setActiveTool(null);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const parts = (lastMessage as any).parts;
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        if (part.type?.startsWith("tool-")) {
          const toolName = part.type.replace("tool-", "");
          if (
            part.state === "input-streaming" ||
            part.state === "input-available" ||
            part.state === "executing"
          ) {
            setActiveTool(toolName);
            return;
          }
        }
      }
    }
  }, [messages, isLoading]);

  // Get loading text based on active tool
  const getLoadingText = () => {
    if (activeTool === "internalKnowledgeSearchTool") {
      return "Searching portfolio content...";
    }

    return "Thinking...";
  };

  const fetchSuggestions = async (messages: UIMessage[]) => {
    setSuggestionsLoading(true);
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      posthog?.capture("suggestions_fetch_complete", {
        suggestions_count: data.suggestions?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handlePromptSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText) {
      return;
    }

    posthog?.capture("message_sent", {
      has_text: hasText,
      message_length: message.text?.length || 0,
      is_first_message: messages.length === 0,
    });

    sendMessage({
      text: message.text || "",
    });

    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    posthog?.capture("suggestion_clicked", {
      suggestion_text: suggestion,
      suggestion_length: suggestion.length,
    });

    sendMessage({ text: suggestion });
  };

  return (
    <>
      {/* Empty state */}
      {isEmptyState && !readOnly && (
        <ChatEmptyState
          title={"Chat with Prakhar's Portfolio"}
          description={"Ask me about my blog posts, projects, and experience"}
          placeholder={"Ask about my projects, blog posts, or experience..."}
          input={input}
          onInputChange={setInput}
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          status={status as ChatStatus}
          isEmptyStateTextareaRef={
            emptyStateTextareaRef as React.RefObject<HTMLTextAreaElement>
          }
        />
      )}

      {/* Chat state */}
      {!isEmptyState && (
        <>
          <BaseChat messages={messages}>
            <KnowledgeMessageRenderer
              messages={messages}
              messageSources={knowledgeExtraction.messageSources}
              isLoading={isLoading}
            />

            {/* Show loader when processing */}
            {isLoading && (
              <AnimatedLoadingText text={getLoadingText()} />
            )}
          </BaseChat>

          {/* Prompt input at bottom */}
          {!readOnly && (
            <ChatPromptInput
              input={input}
              onInputChange={setInput}
              onSubmit={handlePromptSubmit}
              isLoading={isLoading}
              status={status as ChatStatus}
              placeholder={"Ask about my projects, blog posts, or experience..."}
              chatStateTextareaRef={
                chatStateTextareaRef as React.RefObject<HTMLTextAreaElement>
              }
              onSuggestionClick={handleSuggestionClick}
              suggestions={suggestions}
              suggestionsLoading={suggestionsLoading}
            />
          )}
        </>
      )}
    </>
  );
}
