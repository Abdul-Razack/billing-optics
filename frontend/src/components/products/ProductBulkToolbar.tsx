"use client";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  X, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Download, 
  Package,
  FolderTree
} from "lucide-react";

export type ProductBulkActionType = "activate" | "deactivate" | "delete" | "export" | "stock" | "category";

interface ProductBulkToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAction: (action: ProductBulkActionType) => void;
}

export function ProductBulkToolbar({
  selectedCount,
  onClearSelection,
  onAction
}: ProductBulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-center gap-4 rounded-full border border-border bg-background/95 backdrop-blur shadow-lg px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-muted-foreground">selected</span>
        </div>
        
        <div className="h-4 w-[1px] bg-border" />
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 px-3">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 px-3">
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onAction("activate")}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Activate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("deactivate")}>
                <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                Deactivate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction("stock")}>
                <Package className="mr-2 h-4 w-4 text-blue-600" />
                Update Min Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("category")}>
                <FolderTree className="mr-2 h-4 w-4 text-purple-600" />
                Assign Category
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction("export")}>
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction("delete")} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
