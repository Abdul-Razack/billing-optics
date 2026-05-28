import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { ExportService } from "@/services/export.service";

interface InvoicePdfExportProps {
  invoiceId: string | number;
  filename?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export function InvoicePdfExport({ invoiceId, className, variant = "outline" }: InvoicePdfExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Generating PDF from server...");
    
    try {
      await ExportService.exportInvoicePdf(invoiceId);
      toast.success("PDF downloaded successfully", { id: toastId });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleExport} 
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Exporting..." : "Download PDF"}
    </Button>
  );
}
