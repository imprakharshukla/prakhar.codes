import { useState } from "react";
import { Loader2 } from "lucide-react";

// Declare PostHog type
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
    };
  }
}

interface ResumeButtonProps {
  children: React.ReactNode;
  title: string;
}

export default function ResumeButton({ children, title }: ResumeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsLoading(true);

    // Track resume download
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('resume_downloaded', {
        source: 'header_button',
        format: 'pdf',
        page: window.location.pathname,
      });
    }

    // The browser will navigate to the link, no need to reset loading state
  };

  return (
    <a
      href="/resume/latest"
      onClick={handleClick}
      className="py-1 px-2 w-fit border-border transform duration-200 hover:text-primary text-muted-foreground hover:bg-primary/10 items-center border rounded-md bg-card flex gap-2 cursor-pointer"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        children
      )}
      <span className="text-foreground description">{title}</span>
    </a>
  );
}
