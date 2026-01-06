"use client";

import { KnowledgeChat } from "@/components/chat/knowledge-chat";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const isWidget = searchParams.get('widget') === 'true';

  // Add class to html for widget-specific styling
  useEffect(() => {
    if (isWidget) {
      document.documentElement.classList.add('widget-mode');
    }
    return () => {
      document.documentElement.classList.remove('widget-mode');
    };
  }, [isWidget]);

  return (
    <div className="flex flex-col h-screen">
      <KnowledgeChat apiEndpoint="/api/chat" />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex flex-col h-screen" />}>
      <ChatPageContent />
    </Suspense>
  );
}
