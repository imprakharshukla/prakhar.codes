"use client";

import { cn } from "@prakhar/ui";

interface AnimatedLoadingTextProps {
  text: string;
  className?: string;
  duration?: number;
  spread?: number;
}

/**
 * Animated loading text component with shimmer effect
 * Text shimmer animation with gradient clip
 */
export function AnimatedLoadingText({
  text,
  className,
  duration = 2,
  spread = 2,
}: AnimatedLoadingTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block bg-gradient-to-r from-foreground via-foreground/40 to-foreground bg-[length:200%_100%] animate-shimmer",
        className
      )}
      style={
        {
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animationDuration: `${duration}s`,
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
}
