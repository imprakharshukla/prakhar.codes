import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We'll handle this manually in the provider
      capture_pageleave: true,
    });
  }
  return posthog;
}
