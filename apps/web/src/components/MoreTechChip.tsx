import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@prakhar/ui";

export default function MoreTechChip() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-xs/5 bg-card text-foreground border border-border cursor-help">
            <svg
              className="h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            More
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-foreground">
            I've worked with tons of different tech stacks and I love learning new things. This list is not static and never will be.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
