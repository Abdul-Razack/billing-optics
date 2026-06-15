"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackagePlus, Loader2 } from "lucide-react";

interface BulkStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (minStockAlert: number) => void;
  selectedCount: number;
  isProcessing: boolean;
}

export function BulkStockModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isProcessing,
}: BulkStockModalProps) {
  const [stockValue, setStockValue] = useState<string>("");

  const handleConfirm = () => {
    const val = parseInt(stockValue, 10);
    if (!isNaN(val) && val >= 0) {
      onConfirm(val);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            Bulk Update Min Stock
          </DialogTitle>
          <DialogDescription>
            This will update the minimum stock alert threshold for all {selectedCount} selected products.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-stock-value">New Minimum Stock Level</Label>
            <Input 
              id="bulk-stock-value"
              type="NUMBER"
              min="0"
              placeholder="e.g. 10"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
              disabled={isProcessing}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing || stockValue === "" || parseInt(stockValue, 10) < 0}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Stock Alerts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
