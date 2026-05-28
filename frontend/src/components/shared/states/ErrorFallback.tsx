import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorFallback({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again.",
  onRetry,
  className = "",
}: ErrorFallbackProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 md:p-10 text-center rounded-xl border border-destructive/20 bg-destructive/5 animate-in fade-in duration-300 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
