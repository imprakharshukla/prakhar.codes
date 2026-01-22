import { useState, useEffect } from "react";

interface TopBannerProps {
  message: string;
  link?: {
    text: string;
    href: string;
  };
  variant?: "info" | "warning" | "success";
  dismissible?: boolean;
  bannerId?: string;
}

export function TopBanner({
  message,
  link,
  variant = "info",
  dismissible = true,
  bannerId = "top-banner",
}: TopBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`banner-dismissed-${bannerId}`);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [bannerId]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`banner-dismissed-${bannerId}`, "true");
  };

  if (!isVisible) return null;

  const variantStyles = {
    info: "bg-primary/10 border-primary/20 text-primary",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    success: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
  };

  return (
    <div
      className={`w-full border-b px-4 py-2.5 text-sm font-medium ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center sm:justify-start">
          <span className="hidden sm:inline">{message}</span>
          <span className="sm:hidden truncate">Building Post Sonar</span>
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold whitespace-nowrap"
            >
              {link.text}
            </a>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:opacity-70 transition-opacity shrink-0"
            aria-label="Dismiss banner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
