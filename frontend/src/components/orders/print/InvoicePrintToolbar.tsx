import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Eye, FileText, ReceiptText } from "lucide-react";
import { InvoicePdfExport } from "./InvoicePdfExport";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";

interface InvoicePrintToolbarProps {
  printRef: RefObject<HTMLDivElement | null>;
  receiptRef?: RefObject<HTMLDivElement | null>;
  invoiceNumber: string;
  invoiceId: string | number;
}

export function InvoicePrintToolbar({ printRef, receiptRef, invoiceNumber, invoiceId }: InvoicePrintToolbarProps) {
  const handlePrintInvoice = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoiceNumber}`
  });

  const handlePrintReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${invoiceNumber}`
  });

  const filename = `invoice-${invoiceNumber}.pdf`;

  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* Print Actions */}
      <Button variant="outline" onClick={() => handlePrintInvoice()}>
        <FileText className="mr-2 h-4 w-4" /> Print A4
      </Button>
      
      {receiptRef && (
        <Button variant="outline" onClick={() => handlePrintReceipt()}>
          <ReceiptText className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
      )}

      {/* PDF Export Action */}
      <InvoicePdfExport invoiceId={invoiceId} filename={filename} />

      {/* Preview Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Print Preview: {invoiceNumber}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 border rounded-md p-4 bg-gray-100 flex justify-center overflow-x-auto">
            {/* We clone the printRef's content here for a visual preview if possible, 
                but React refs don't clone automatically. 
                Instead, we rely on the consumer of this toolbar to render the PrintableInvoice 
                visibly inside the dialog if we want, or we just render a scaled down version.
                For simplicity, since the actual PrintableInvoice is mounted off-screen or hidden, 
                we can render it via portals or just accept that the preview button might be better 
                implemented by toggling a state in the parent component. 
                Wait, let's keep it simple: the parent can just pass the preview content as children 
                if we use it as a wrapper, or we can just remove the Dialog and let the parent handle preview. */}
            <p className="text-sm text-gray-500 italic">Preview is available via the browser&apos;s native Print dialog.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
