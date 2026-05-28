import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";

interface SecureActionConfirmProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  children: React.ReactNode; // The trigger button
  actionLabel?: string;
  isDestructive?: boolean;
}

export function SecureActionConfirm({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. Please confirm to proceed.",
  onConfirm,
  children,
  actionLabel = "Confirm",
  isDestructive = true,
}: SecureActionConfirmProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isDestructive && <ShieldAlert className="h-5 w-5 text-destructive" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
