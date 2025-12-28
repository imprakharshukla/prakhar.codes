import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function HiringPopover() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="https://cal.com/imprakharshukla"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500/20 text-foreground font-medium px-1 -mx-1 rounded hover:bg-green-500/30 transition-all cursor-pointer"
          >
            exploring new opportunities
          </a>
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
                  Full-stack or Founding Engineer
                </div>
                <div>
                  <span className="text-foreground font-medium">Stack:</span>{" "}
                  TypeScript, React, Node.js, AI/ML
                </div>
                <div>
                  <span className="text-foreground font-medium">Location:</span>{" "}
                  Remote (India) or willing to relocate
                </div>
                <div>
                  <span className="text-foreground font-medium">
                    Availability:
                  </span>{" "}
                  Immediate
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/30">
              <a
                href="https://cal.com/imprakharshukla"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Schedule a call →
              </a>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
