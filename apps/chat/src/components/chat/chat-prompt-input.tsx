import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { Skeleton } from "@prakhar/ui";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { ChatStatus } from "ai";

interface ChatPromptInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (message: PromptInputMessage) => void;
  isLoading: boolean;
  status?: ChatStatus;
  placeholder: string;
  chatStateTextareaRef?: React.RefObject<HTMLTextAreaElement>;
  onSuggestionClick?: (suggestion: string) => void;
  suggestions?: string[];
  suggestionsLoading?: boolean;
}

export function ChatPromptInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  status,
  placeholder,
  chatStateTextareaRef,
  onSuggestionClick,
  suggestions,
  suggestionsLoading,
}: ChatPromptInputProps) {
  return (
    <div className="grid shrink-0 gap-4 pt-4 max-w-4xl mx-auto w-full">
      {/* Show suggestions above input */}
      {suggestions && suggestions.length > 0 && !isLoading && onSuggestionClick && (
        <Suggestions className="px-4">
          {suggestions.map((suggestion, idx) => (
            <Suggestion
              key={idx}
              suggestion={suggestion}
              onClick={onSuggestionClick}
            />
          ))}
        </Suggestions>
      )}

      {/* Show loading skeleton */}
      {suggestionsLoading && !isLoading && (
        <Suggestions className="px-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-32 rounded-full" />
          ))}
        </Suggestions>
      )}

      <div className="px-4 pb-4">
        <PromptInput onSubmit={onSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              ref={chatStateTextareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
            />
          </PromptInputBody>
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit disabled={isLoading || !input} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

