"use client";

import { Button } from "@prakhar/ui";
import { cn } from "@prakhar/ui";
import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-auto hide-scrollbar", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Function to fix nested scrollable divs
    const fixNestedScroll = () => {
      const children = element.querySelectorAll("div");
      children.forEach((child) => {
        const style = window.getComputedStyle(child);
        const inlineStyle = child.getAttribute("style") || "";
        const hasOverflow =
          style.overflow === "auto" ||
          style.overflow === "scroll" ||
          style.overflowY === "auto" ||
          style.overflowY === "scroll" ||
          inlineStyle.includes("overflow");

        const canScroll = child.scrollHeight > child.clientHeight;

        if (hasOverflow && canScroll) {
          // Force remove overflow and height constraints using CSSStyleDeclaration
          const childEl = child as HTMLElement;
          childEl.style.overflow = "visible";
          childEl.style.overflowY = "visible";
          childEl.style.overflowX = "visible";
          childEl.style.height = "auto";
          childEl.style.maxHeight = "none";

          // Also add a class to ensure CSS rules apply
          childEl.classList.add("no-scroll-fix");
        }
      });
    };

    // Fix nested scroll immediately and periodically
    fixNestedScroll();
    const timeout = setTimeout(fixNestedScroll, 100);
    const interval = setInterval(fixNestedScroll, 1000);

    // Use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      fixNestedScroll();
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <StickToBottom.Content
      // @ts-ignore
      ref={ref}
      className={cn("conversation-content", className)}
      {...props}
    />
  );
};

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full",
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
