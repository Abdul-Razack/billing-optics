import { Button } from "@/components/ui/button";
import { Trash2, X, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface BulkOrderToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkStatusUpdate: (status: string) => void;
  isProcessing?: boolean;
}

export function BulkOrderToolbar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkStatusUpdate,
  isProcessing = false,
}: BulkOrderToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-md p-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <Badge variant="default" className="text-sm px-2 py-0.5 font-medium">
          {selectedCount} Selected
        </Badge>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          orders selected for bulk actions
        </span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onBulkStatusUpdate("COMPLETED")}>
              Mark as Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkStatusUpdate("CANCELLED")}>
              Mark as Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Delete Selected</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          disabled={isProcessing}
          className="shrink-0"
          title="Clear Selection"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
