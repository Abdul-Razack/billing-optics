import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface ProductHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  children?: ReactNode;
}

export function ProductHeader({ title, description, action, children }: ProductHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1>{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3 print:hidden">
        {children}
        {action && (
          <Button asChild>
            <Link href={action.href}>
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
