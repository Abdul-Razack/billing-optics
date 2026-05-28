"use client";

import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle } from "lucide-react";

interface ProductEditHeaderProps {
  title: string;
  isDirty?: boolean;
}

export function ProductEditHeader({ title, isDirty = false }: ProductEditHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/20">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {title}
            {isDirty && (
              <Badge variant="secondary" className="ml-2 bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20 font-medium">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unsaved changes
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update product details, inventory, and pricing.
          </p>
        </div>
      </div>
    </div>
  );
}
