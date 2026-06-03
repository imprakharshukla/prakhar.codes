import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@prakhar/ui";
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import {
  SHOW_HIRING_AVAILABILITY,
  hiringAvailability,
} from "../data/site-settings";

export default function HiringPopover() {
  useEffect(() => {
    if (!SHOW_HIRING_AVAILABILITY) return;

    (async function () {
      const cal = await getCalApi({ namespace: "hiring" });
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#7B89EF" },
          dark: { "cal-brand": "#7B89EF" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  if (!SHOW_HIRING_AVAILABILITY) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-cal-namespace="hiring"
            data-cal-link="imprakharshukla/30min"
            data-cal-config='{"layout":"month_view"}'
            className="bg-green-500/35 text-foreground font-medium px-1 mx-[0.1px] rounded hover:bg-green-500/30 transition-all cursor-pointer"
          >
            available for roles
          </button>
        </TooltipTrigger>
        <TooltipContent className="w-80 border-border/60 p-4" align="start">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-foreground mb-2">
                What I'm looking for
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="text-foreground font-medium">Role:</span>{" "}
                  {hiringAvailability.role}
                </div>
                <div>
                  <span className="text-foreground font-medium">Stack:</span>{" "}
                  {hiringAvailability.stack}
                </div>
                <div>
                  <span className="text-foreground font-medium">Location:</span>{" "}
                  {hiringAvailability.location}
                </div>
                <div>
                  <span className="text-foreground font-medium">
                    Availability:
                  </span>{" "}
                  {hiringAvailability.availability}
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/30">
              <button
                data-cal-namespace="hiring"
                data-cal-link="imprakharshukla/30min"
                data-cal-config='{"layout":"month_view"}'
                className="text-xs text-primary hover:underline"
              >
                Schedule a call →
              </button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
