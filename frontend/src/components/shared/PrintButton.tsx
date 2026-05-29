"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ButtonProps } from "@/components/ui/button";

interface PrintButtonProps extends ButtonProps {
  label?: string;
}

export function PrintButton({ label = "Print", variant = "outline", className, ...props }: PrintButtonProps) {
  return (
    <Button 
      variant={variant} 
      className={`print:hidden ${className || ""}`}
      onClick={() => window.print()} 
      {...props}
    >
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
