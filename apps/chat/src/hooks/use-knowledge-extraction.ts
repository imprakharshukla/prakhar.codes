import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "@ai-sdk/react";
import type { SourceInfo } from "@/app/(with-sidebar)/_components/shared/types";

interface UseKnowledgeExtractionProps {
  messages: UIMessage[];
}

export function useKnowledgeExtraction({
  messages,
}: UseKnowledgeExtractionProps) {
  const [messageSources, setMessageSources] = useState<
    Map<string, SourceInfo[]>
  >(new Map());

  const parsedSourcesRef = useRef<Set<string>>(new Set());

  // Extract data from message parts
  const extractFromMessageParts = (parts: any[], messageId: string) => {
    const sources: SourceInfo[] = [];
    const seenSources = new Set<string>();

    for (const part of parts) {
      // Extract sources from internal_knowledge_search tool (searches portfolio content)
      const partType = (part as any).type;
      const isInternalTool =
        partType === "tool-internalKnowledgeSearchTool" ||
        partType === "tool-internal_knowledge_search" ||
        partType === "tool-result" ||
        partType === "tool_result";

      const hasInternalToolName =
        (part as any).toolName === "internal_knowledge_search" ||
        (part as any).toolName === "internalKnowledgeSearchTool" ||
        (part as any).tool_name === "internal_knowledge_search" ||
        (part as any).tool_name === "internalKnowledgeSearchTool";

      if (
        partType === "tool-internalKnowledgeSearchTool" ||
        (isInternalTool && hasInternalToolName)
      ) {
        const result =
          (part as any).result ||
          (part as any).output ||
          (part as any).content;

        if (result?.sources && Array.isArray(result.sources)) {
          result.sources.forEach((source: any) => {
            const sourceName =
              source.metadata?.source || "Unknown source";
            const sourceUrl = source.metadata?.url || `#${sourceName}`;
            const sourceKey = `internal:${sourceName}`;
            if (!seenSources.has(sourceKey)) {
              seenSources.add(sourceKey);
              sources.push({
                title: sourceName,
                href: sourceUrl,
                url: sourceUrl,
                isExternal: false,
              });
            }
          });
        }

        // Also check relevantContext for sources
        if (
          result?.relevantContext &&
          Array.isArray(result.relevantContext)
        ) {
          result.relevantContext.forEach((ctx: any) => {
            if (ctx.source) {
              const sourceUrl = ctx.url || `#${ctx.source}`;
              const sourceKey = `internal:${ctx.source}`;
              if (!seenSources.has(sourceKey)) {
                seenSources.add(sourceKey);
                sources.push({
                  title: ctx.source,
                  href: sourceUrl,
                  url: sourceUrl,
                  isExternal: false,
                });
              }
            }
          });
        }
      }
    }

    return sources;
  };

  // Parse historical messages to extract data on load
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const unparsedMessages = messages.filter(
      (msg) => msg.role === "assistant" && !parsedSourcesRef.current.has(msg.id)
    );

    if (unparsedMessages.length === 0) {
      return;
    }

    const sourcesMap = new Map<string, SourceInfo[]>();
    let hasNewSources = false;

    for (const message of unparsedMessages) {
      const parts = (message as any).parts;
      if (!parts || !Array.isArray(parts)) {
        parsedSourcesRef.current.add(message.id);
        continue;
      }

      const messageSources: SourceInfo[] = [];
      const seenSources = new Set<string>();

      for (const part of parts) {
        const p = part as any;

        // Extract sources from internal_knowledge_search tool
        const isInternalSearchTool =
          p.type === "tool-internalKnowledgeSearchTool" ||
          p.type === "tool-internal_knowledge_search" ||
          p.type === "tool-result" ||
          p.type === "tool_result" ||
          p.type === "tool-invocation";

        const hasInternalSearchToolName =
          p.toolName === "internal_knowledge_search" ||
          p.toolName === "internalKnowledgeSearchTool" ||
          p.tool_name === "internal_knowledge_search" ||
          p.tool_name === "internalKnowledgeSearchTool" ||
          (p.toolInvocation &&
            (p.toolInvocation.toolName === "internal_knowledge_search" ||
              p.toolInvocation.toolName === "internalKnowledgeSearchTool"));

        if (
          p.type === "tool-internalKnowledgeSearchTool" ||
          (isInternalSearchTool && hasInternalSearchToolName)
        ) {
          const result =
            p.result ||
            p.output ||
            p.content ||
            (p.toolInvocation && p.toolInvocation.result);

          if (result?.sources && Array.isArray(result.sources)) {
            result.sources.forEach((source: any) => {
              const sourceName = source.metadata?.source || "Unknown source";
              const sourceUrl = source.metadata?.url || `#${sourceName}`;
              const sourceKey = `internal:${sourceName}`;
              if (!seenSources.has(sourceKey)) {
                seenSources.add(sourceKey);
                messageSources.push({
                  title: sourceName,
                  href: sourceUrl,
                  url: sourceUrl,
                  isExternal: false,
                });
              }
            });
          }
          if (
            result?.relevantContext &&
            Array.isArray(result.relevantContext)
          ) {
            result.relevantContext.forEach((ctx: any) => {
              if (ctx.source) {
                const sourceUrl = ctx.url || `#${ctx.source}`;
                const sourceKey = `internal:${ctx.source}`;
                if (!seenSources.has(sourceKey)) {
                  seenSources.add(sourceKey);
                  messageSources.push({
                    title: ctx.source,
                    href: sourceUrl,
                    url: sourceUrl,
                    isExternal: false,
                  });
                }
              }
            });
          }
        }
      }

      parsedSourcesRef.current.add(message.id);

      if (messageSources.length > 0) {
        sourcesMap.set(message.id, messageSources);
        hasNewSources = true;
      }
    }

    if (hasNewSources) {
      setMessageSources((prev) => {
        const next = new Map(prev);
        let hasChanges = false;
        for (const [messageId, sources] of sourcesMap.entries()) {
          const existingSources = prev.get(messageId);
          if (
            !existingSources ||
            existingSources.length !== sources.length ||
            !existingSources.every(
              (s, i) =>
                s.title === sources[i]?.title && s.url === sources[i]?.url
            )
          ) {
            next.set(messageId, sources);
            hasChanges = true;
          }
        }
        return hasChanges ? next : prev;
      });
    }
  }, [messages]);

  // Expose method to extract from finished message
  const extractFromFinishedMessage = (message: UIMessage) => {
    try {
      const parts = message.parts;

      if (parts && Array.isArray(parts)) {
        const sources = extractFromMessageParts(parts, message.id);

        if (sources.length > 0) {
          setMessageSources((prev) => {
            const next = new Map(prev);
            const existingSources = prev.get(message.id);
            if (
              !existingSources ||
              existingSources.length !== sources.length ||
              !existingSources.every(
                (s, i) =>
                  s.title === sources[i]?.title && s.url === sources[i]?.url
              )
            ) {
              next.set(message.id, sources);
              return next;
            }
            return prev;
          });
        }
        parsedSourcesRef.current.add(message.id);
      }
    } catch (error) {
      // Silently handle parsing errors
    }
  };

  return {
    messageSources,
    extractFromFinishedMessage,
  };
}
