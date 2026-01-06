import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { ChatStatus } from "ai";

interface ChatEmptyStateProps {
  title: string;
  description?: string;
  placeholder: string;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (message: PromptInputMessage) => void;
  isLoading: boolean;
  status?: ChatStatus;
  isEmptyStateTextareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function ChatEmptyState({
  title,
  description,
  placeholder,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  status,
  isEmptyStateTextareaRef,
}: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0 items-center justify-center px-4 space-y-8">
      <div className="text-center space-y-4 w-full max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight break-words">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground break-words">{description}</p>
        )}
      </div>

      <div className="w-full max-w-2xl space-y-4 min-w-0">
        <PromptInput onSubmit={onSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              ref={isEmptyStateTextareaRef}
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
