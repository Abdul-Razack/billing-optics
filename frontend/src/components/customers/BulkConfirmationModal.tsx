"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

export type BulkActionType = "activate" | "deactivate" | "delete" | null;

interface BulkConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: BulkActionType;
  selectedCount: number;
  isProcessing: boolean;
}

export function BulkConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  selectedCount,
  isProcessing,
}: BulkConfirmationModalProps) {
  if (!actionType) return null;

  const isDestructive = actionType === "delete" || actionType === "deactivate";

  const getTitle = () => {
    switch (actionType) {
      case "activate": return "Activate Customers";
      case "deactivate": return "Deactivate Customers";
      case "delete": return "Delete Customers";
      default: return "Confirm Action";
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case "activate": 
        return `Are you sure you want to activate ${selectedCount} selected customer(s)? They will regain full access.`;
      case "deactivate": 
        return `Are you sure you want to deactivate ${selectedCount} selected customer(s)? They will temporarily lose access.`;
      case "delete": 
        return `You are about to permanently delete ${selectedCount} customer(s). This action cannot be undone.`;
      default: 
        return `Are you sure you want to perform this action on ${selectedCount} customer(s)?`;
    }
  };

  const getConfirmText = () => {
    switch (actionType) {
      case "activate": return "Activate";
      case "deactivate": return "Deactivate";
      case "delete": return "Delete permanently";
      default: return "Confirm";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDestructive && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            variant={isDestructive ? "destructive" : "default"} 
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getConfirmText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
