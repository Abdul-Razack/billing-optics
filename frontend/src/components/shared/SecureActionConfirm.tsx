import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";

interface SecureActionConfirmProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  children: React.ReactNode; // The trigger element
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
  const [open, setOpen] = useState(false);

  // Safely clone the trigger element to attach click and select handlers
  // This allows it to work seamlessly for both standard buttons and dropdown menu items
  // without creating nested/duplicated ARIA roles.
  const triggerElement = React.isValidElement(children) ? children : <span>{children}</span>;
  const trigger = React.cloneElement(triggerElement as React.ReactElement<any>, {
    onClick: (e: any) => {
      (triggerElement as React.ReactElement<any>).props.onClick?.(e);
      setOpen(true);
    },
    onSelect: (e: any) => {
      e.preventDefault();
      (triggerElement as React.ReactElement<any>).props.onSelect?.(e);
      setOpen(true);
    },
  });

  return (
    <>
      {trigger}
      <AlertDialog open={open} onOpenChange={setOpen}>
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
              onClick={(e: any) => {
                onConfirm();
                setOpen(false);
              }}
              className={isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
