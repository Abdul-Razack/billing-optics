"use client";

import { useEffect } from "react";

interface UnsavedChangesGuardProps {
  isDirty: boolean;
}

export function UnsavedChangesGuard({ isDirty }: UnsavedChangesGuardProps) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  return null;
}
