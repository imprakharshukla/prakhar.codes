import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

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

  return (
    <button
      data-cal-namespace={namespace}
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      className="contents"
    >
      {children}
    </button>
  );
}
