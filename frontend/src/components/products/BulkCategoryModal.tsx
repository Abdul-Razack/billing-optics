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
import { Label } from "@/components/ui/label";
import { FolderTree, Loader2 } from "lucide-react";
import { ApiCategory } from "@/services/category.service";

interface BulkCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryId: number) => void;
  selectedCount: number;
  isProcessing: boolean;
  categories: ApiCategory[];
}

export function BulkCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isProcessing,
  categories,
}: BulkCategoryModalProps) {
  const [categoryId, setCategoryId] = useState<string>("");

  const handleConfirm = () => {
    if (categoryId) {
      onConfirm(parseInt(categoryId, 10));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-purple-600" />
            Bulk Assign Category
          </DialogTitle>
          <DialogDescription>
            Select a new category to assign to all {selectedCount} selected products.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>New Category</Label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isProcessing}
            >
              <option value="" disabled>Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing || !categoryId}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
