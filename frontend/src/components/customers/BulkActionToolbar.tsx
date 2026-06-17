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
  Tags 
} from "lucide-react";
import { BulkActionType } from "./BulkConfirmationModal";

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAction: (action: BulkActionType | "export" | "tags") => void;
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  onAction
}: BulkActionToolbarProps) {
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
              <DropdownMenuItem onSelect={() => onAction("activate")}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Activate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAction("deactivate")}>
                <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                Deactivate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAction("tags")} disabled>
                <Tags className="mr-2 h-4 w-4" />
                Assign Tags
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onAction("export")}>
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onAction("delete")} variant="destructive">
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
