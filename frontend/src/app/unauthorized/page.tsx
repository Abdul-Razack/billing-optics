"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full">
        <EmptyState 
          icon={ShieldAlert}
          title="Access Denied"
          description="You do not have the required permissions to view this page. Please contact your administrator if you believe this is a mistake."
          actionLabel="Return to Dashboard"
          onAction={() => router.push("/")}
        />
      </div>
    </div>
  );
}
