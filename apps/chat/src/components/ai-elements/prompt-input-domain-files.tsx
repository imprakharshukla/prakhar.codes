"use client";

import { useEffect, useState } from "react";
import { FileText, ExternalLink, Loader2Icon, XIcon } from "lucide-react";
import { Button } from "@prakhar/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@prakhar/ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@prakhar/ui";
import { cn } from "@prakhar/ui";

interface DomainFile {
  key: string;
  fileName: string;
  lastModified: string;
  size: number;
  path: string;
}

interface PromptInputDomainFilesProps {
  domain: string;
  onFileSelect?: (file: DomainFile) => void;
  className?: string;
}

export function PromptInputDomainFiles({
  domain,
  onFileSelect,
  className,
}: PromptInputDomainFilesProps) {
  const [files, setFiles] = useState<DomainFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<DomainFile | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  useEffect(() => {
    if (!domain) {
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/files/${domain}`);

        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }

        const data = await response.json();
        setFiles(data.files || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [domain]);

  const handleFileClick = async (file: DomainFile) => {
    setSelectedFile(file);
    setLoadingUrl(true);
    setSignedUrl(null);

    try {
      const encodedKey = encodeURIComponent(file.key);
      const response = await fetch(`/api/files/${domain}/${encodedKey}`);

      if (!response.ok) {
        throw new Error("Failed to generate signed URL");
      }

      const data = await response.json();
      setSignedUrl(data.url);

      // Call onFileSelect callback if provided
      if (onFileSelect) {
        onFileSelect(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file");
    } finally {
      setLoadingUrl(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  if (error) {
    return null; // Silently fail - don't show error in UI
  }

  if (files.length === 0) {
    return null; // Don't show anything if no files
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {files.map((file) => (
          <PromptInputDomainFile
            key={file.key}
            file={file}
            onClick={() => handleFileClick(file)}
            formatFileSize={formatFileSize}
            formatDate={formatDate}
          />
        ))}
      </div>

      <Dialog
        open={!!selectedFile}
        onOpenChange={(open) => !open && setSelectedFile(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedFile?.fileName}</DialogTitle>
            <DialogDescription>
              {selectedFile && (
                <>
                  {formatFileSize(selectedFile.size)} •{" "}
                  {formatDate(selectedFile.lastModified)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingUrl ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="h-6 w-6 animate-spin" />
            </div>
          ) : signedUrl ? (
            <ScrollArea className="max-h-[60vh]">
              <iframe
                src={signedUrl}
                className="w-full h-[600px] border rounded-md"
                title={selectedFile?.fileName}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(signedUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in new tab
                </Button>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load file preview
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface PromptInputDomainFileProps {
  file: DomainFile;
  onClick: () => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
}

function PromptInputDomainFile({
  file,
  onClick,
  formatFileSize,
  formatDate,
}: PromptInputDomainFileProps) {
  const filename = file.fileName || "File";

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "group relative flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md border border-border px-1.5 font-medium text-sm transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
          )}
          onClick={onClick}
        >
          <div className="relative size-5 shrink-0">
            <div className="absolute inset-0 flex size-5 items-center justify-center overflow-hidden rounded bg-background transition-opacity group-hover:opacity-0">
              <div className="flex size-5 items-center justify-center text-muted-foreground">
                <FileText className="size-3" />
              </div>
            </div>
            <Button
              aria-label="View file"
              className="absolute inset-0 size-5 cursor-pointer rounded p-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [&>svg]:size-2.5"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              type="button"
              variant="ghost"
            >
              <Button.Icon>
                <ExternalLink />
              </Button.Icon>
              <span className="sr-only">View</span>
            </Button>
          </div>

          <span className="flex-1 truncate">{filename}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2" align="start">
        <div className="w-auto space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="min-w-0 flex-1 space-y-1 px-0.5">
              <h4 className="truncate font-semibold text-sm leading-none">
                {filename}
              </h4>
              <p className="truncate font-mono text-muted-foreground text-xs">
                {formatFileSize(file.size)} • {formatDate(file.lastModified)}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs px-0.5">
            I en skreddersydd versjon kan du legge til dokumenter her selv.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
