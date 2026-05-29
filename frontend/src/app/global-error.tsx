"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
          <div className="mx-auto max-w-md space-y-4 text-center">
            <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
            <p className="text-muted-foreground">
              The POS encountered an unexpected error. You can try refreshing or resetting the application state.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  localStorage.removeItem("order_cart_draft");
                  localStorage.clear();
                  window.location.href = "/";
                }}
              >
                Reset POS State
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
