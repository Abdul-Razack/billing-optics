import { AlertOctagon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We encountered an unexpected error while trying to load this data.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-semibold text-destructive mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button variant="outline" className="border-destructive/30 hover:bg-destructive hover:text-white" onClick={onRetry}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
