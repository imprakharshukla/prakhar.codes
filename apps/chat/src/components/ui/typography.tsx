import * as React from "react";
import { cn } from "@prakhar/ui";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  weight?: "normal" | "medium" | "semibold" | "bold" | "black";
  font?: "sans" | "domine";
}

export const Title = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, weight = "bold", font = "sans", ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          // Note: font-domine would need to be added to tailwind config if needed
          // For now, using sans font
          weight === "normal" && "font-normal",
          weight === "medium" && "font-medium",
          weight === "semibold" && "font-semibold",
          weight === "bold" && "font-bold",
          weight === "black" && "font-black",
          className
        )}
        {...props}
      />
    );
  }
);
Title.displayName = "Title";

export const Caption = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, weight = "normal", ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-sm",
          weight === "normal" && "font-normal",
          weight === "medium" && "font-medium",
          weight === "semibold" && "font-semibold",
          weight === "bold" && "font-bold",
          className
        )}
        {...props}
      />
    );
  }
);
Caption.displayName = "Caption";

export const Text = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, weight = "normal", ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          weight === "normal" && "font-normal",
          weight === "medium" && "font-medium",
          weight === "semibold" && "font-semibold",
          weight === "bold" && "font-bold",
          className
        )}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

