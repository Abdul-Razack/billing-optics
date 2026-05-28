"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

interface ProductFormActionsProps {
  isEditMode: boolean;
  isSaving: boolean;
  onSaveAndAddAnother?: () => void;
}

export function ProductFormActions({ isEditMode, isSaving, onSaveAndAddAnother }: ProductFormActionsProps) {
  const router = useRouter();
  const { reset } = useFormContext();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border mt-8 gap-4">
      <div className="flex w-full sm:w-auto gap-3">
        <Button 
          variant="outline" 
          type="button" 
          onClick={() => router.back()} 
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        {!isEditMode && (
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => reset()} 
            disabled={isSaving}
            className="w-full sm:w-auto hidden sm:flex"
          >
            Reset Form
          </Button>
        )}
      </div>

      <div className="flex w-full sm:w-auto gap-3">
        {!isEditMode && (
          <Button 
            variant="secondary" 
            type="button" 
            onClick={onSaveAndAddAnother}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save & Add Another
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
