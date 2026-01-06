import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@prakhar/ui";
import { cva } from "class-variance-authority";
import React, { forwardRef } from "react";
import { Title, Caption, Text } from "./typography";
import { Container } from "./container";
import type { ContainerProps } from "./container";

const pageShellVariants = cva("w-full", {
  variants: {
    spacing: {
      none: "space-y-0",
      sm: "space-y-4",
      md: "space-y-6",
      lg: "space-y-8",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    spacing: "md",
    padding: "none",
  },
});

const pageShellHeaderVariants = cva(
  "flex items-start justify-between gap-4",
  {
    variants: {
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
      },
      direction: {
        row: "flex-row",
        column: "flex-col",
      },
    },
    defaultVariants: {
      align: "start",
      direction: "row",
    },
  }
);

const pageShellContentVariants = cva("flex flex-col gap-2", {
  variants: {
    maxWidth: {
      none: "w-full",
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "2/3": "w-2/3",
      "3/4": "w-3/4",
    },
  },
  defaultVariants: {
    maxWidth: "2/3",
  },
});

export interface PageShellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof pageShellVariants> {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  titleChildren?: React.ReactNode;
  titleFont?: "sans" | "domine";
  headerAlign?: VariantProps<typeof pageShellHeaderVariants>["align"];
  headerDirection?: VariantProps<typeof pageShellHeaderVariants>["direction"];
  contentMaxWidth?: VariantProps<typeof pageShellContentVariants>["maxWidth"];
  /**
   * Optional children to render in the **top-left** area of the header, above the title & description.
   * This is useful for actions like "Back" buttons or close icons that should appear
   * before the main heading content.
   */
  topLeftChildren?: React.ReactNode;
  /**
   * Controls the maximum width of the entire page content (not just the header).
   * Uses the Container component to provide consistent layout widths across the app.
   */
  containerWidth?: ContainerProps["width"];
}

export const PageShell = forwardRef<HTMLDivElement, PageShellProps>(
  (
    {
      className,
      spacing,
      padding,
      title,
      description,
      titleChildren,
      titleFont = "domine",
      headerAlign,
      headerDirection,
      topLeftChildren,
      contentMaxWidth,
      containerWidth,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          pageShellVariants({ spacing, padding }),
          className,
          "py-6 px-4 md:px-6"
        )}
        ref={ref}
        {...props}
      >
        {(title || description || titleChildren || topLeftChildren) && (
          <div
            className={cn(
              pageShellHeaderVariants({
                align: headerAlign,
                direction: headerDirection,
              })
            )}
          >
            <div
              className={cn(
                pageShellContentVariants({ maxWidth: contentMaxWidth })
              )}
            >
              {topLeftChildren && (
                <div className="top-left-children-container">
                  {topLeftChildren}
                </div>
              )}
              {title && (
                <div className="title-container mt-3">
                  {typeof title === "string" ? (
                    <Title
                      weight={"black"}
                      className="text-xl capitalize"
                      font={titleFont}
                    >
                      {title}
                    </Title>
                  ) : (
                    title
                  )}
                </div>
              )}
              {description && (
                <div className="description-container">
                  {typeof description === "string" ? (
                    <Text>{description}</Text>
                  ) : (
                    description
                  )}
                </div>
              )}
            </div>
            {titleChildren && (
              <div className="title-children-container flex-shrink-0">
                {titleChildren}
              </div>
            )}
          </div>
        )}

        {children && (
          <div className="page-shell-content">
            {containerWidth ? (
              <Container width={containerWidth}>{children}</Container>
            ) : (
              children
            )}
          </div>
        )}
      </div>
    );
  }
);

PageShell.displayName = "PageShell";

