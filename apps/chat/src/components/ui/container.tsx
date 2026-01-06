import * as React from "react";
import { cn } from "@prakhar/ui";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, width = "full", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          width === "sm" && "max-w-sm mx-auto",
          width === "md" && "max-w-md mx-auto",
          width === "lg" && "max-w-lg mx-auto",
          width === "xl" && "max-w-xl mx-auto",
          width === "2xl" && "max-w-2xl mx-auto",
          width === "full" && "w-full",
          width === "none" && "",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = "Container";


