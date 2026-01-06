"use client";

import { ThemeProvider } from "./theme-provider";
import { TRPCProvider } from "./trpc-provider";
import { PostHogProvider } from "@/providers/posthog-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        themes={["light", "dark"]}
        disableTransitionOnChange
      >
        <TRPCProvider>{children}</TRPCProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
}
