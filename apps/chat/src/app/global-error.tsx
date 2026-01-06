"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";
import posthog from "posthog-js";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);

    // Track global error in PostHog
    if (typeof window !== 'undefined') {
      posthog.capture('error_occurred', {
        error_message: error.message,
        error_stack: error.stack,
        error_digest: error.digest,
        error_type: error.constructor.name,
        is_global: true,
      });
    }
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}