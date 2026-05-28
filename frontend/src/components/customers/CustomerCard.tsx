import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomerCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function CustomerCard({ title, description, children, className }: CustomerCardProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border shadow-sm", className)}>
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-medium text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
