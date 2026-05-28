import { Input } from "@/components/ui/input";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface MeasurementInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const MeasurementInput = forwardRef<HTMLInputElement, MeasurementInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 flex-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        <Input
          ref={ref}
          className={cn(
            "font-mono text-center h-10 tracking-wide bg-background/50 focus:bg-background transition-colors",
            error ? "border-destructive focus-visible:ring-destructive" : "border-border",
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-destructive leading-tight">{error}</p>}
      </div>
    );
  }
);

MeasurementInput.displayName = "MeasurementInput";
