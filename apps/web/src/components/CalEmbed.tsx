import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

// Declare PostHog type
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
    };
  }
}

interface CalEmbedProps {
  children: React.ReactNode;
  calLink?: string;
  namespace?: string;
}

export default function CalEmbed({
  children,
  calLink = "imprakharshukla/30min",
  namespace = "30min"
}: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace });
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#7B89EF" },
          dark: { "cal-brand": "#7B89EF" }
        },
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    })();
  }, [namespace]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Track schedule call click
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('schedule_call_clicked', {
        source: window.location.pathname === '/' ? 'homepage' : 'other',
        page: window.location.pathname,
        calendar_link: calLink,
      });
    }
  };

  return (
    <button
      data-cal-namespace={namespace}
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      className="contents"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
