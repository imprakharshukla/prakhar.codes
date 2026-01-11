"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@prakhar/ui";

// Declare PostHog type
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
    };
  }
}

// Ensure CHAT_URL always has a protocol
const getChatUrl = () => {
  const url = import.meta.env.PUBLIC_CHAT_URL || "http://localhost:3001";
  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

const CHAT_URL = getChatUrl();

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showLabel, setShowLabel] = useState(true);

  // Hide label after 5 seconds on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Reset iframe loaded state when opening
  useEffect(() => {
    if (open) {
      setIframeLoaded(false);
    }
  }, [open]);

  // Track chat widget opened
  const handleToggleChat = (newState: boolean) => {
    setOpen(newState);

    if (newState && typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('chat_widget_opened', {
        page: window.location.pathname,
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {/* Overlay - only show when open */}
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => handleToggleChat(false)}
          />
        )}

        {/* Chat Panel */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-36 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-10rem)] sm:h-[700px] max-h-[700px] bg-background border border-border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background shrink-0">
              <div>
                <h3 className="font-semibold text-foreground">
                  Chat with Portfolio
                </h3>
                {/* <p className="text-sm text-muted-foreground">Ask me anything</p> */}
              </div>
              <button
                onClick={() => handleToggleChat(false)}
                className="hover:bg-accent rounded-sm p-1 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* iframe container */}
            <div className="flex-1 overflow-hidden relative">
              {/* Skeleton loader */}
              {!iframeLoaded && (
                <div className="absolute inset-0 p-4 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <div className="space-y-2 pt-8">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              )}

              {/* iframe */}
              <iframe
                src={`${CHAT_URL}?widget=true`}
                className={`w-full h-full border-0 ${
                  !iframeLoaded ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300`}
                title="Portfolio Chat"
                allow="clipboard-write"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button with Label */}
      <motion.div
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2 sm:gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", damping: 20, stiffness: 300 }}
      >
        <AnimatePresence>
          {showLabel && !open && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg whitespace-nowrap font-medium text-sm sm:text-base"
            >
              Talk to my portfolio
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleToggleChat(!open)}
          className="rounded-full bg-primary p-3 sm:p-4 shadow-lg"
          aria-label={open ? "Close chat" : "Open chat"}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </>
  );
}
