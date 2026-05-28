import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div className={cn("w-full max-w-md mx-auto bg-card rounded-lg border border-border shadow-md", className)}>
      <div className="flex flex-col items-center justify-center p-8 border-b border-border text-center space-y-2">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          {/* Using a placeholder for logo */}
          <span className="text-primary font-bold text-xl">OE</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}
