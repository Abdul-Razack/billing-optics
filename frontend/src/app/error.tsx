"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
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
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md space-y-6 text-center border p-8 rounded-lg shadow-sm bg-card">
        <h2 className="text-2xl font-bold text-destructive">Application Error</h2>
        <p className="text-muted-foreground text-sm">
          The POS encountered an unexpected error. This can happen if local data becomes corrupted or a critical process is interrupted.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => window.location.reload()} variant="default">
            Refresh Page
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              localStorage.removeItem("order_cart_draft");
              window.location.href = "/orders/create";
            }}
          >
            Clear Checkout Cart
          </Button>
          <Button 
            variant="destructive"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Hard Reset POS State
          </Button>
        </div>
      </div>
    </div>
  );
}
