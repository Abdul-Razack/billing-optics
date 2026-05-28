import { ApiInvoice } from "@/types/order";
import { Button } from "@/components/ui/button";
import { 
  Printer, 
  Download, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Copy,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";

export function OrderActionsBar({ invoice, onRecordPayment }: { invoice: ApiInvoice, onRecordPayment: () => void }) {
  const handlePrint = () => {
    window.print();
  };


  const handleCancel = () => {
    toast.error("Cancelling order... (Mock)");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      
      {invoice.status !== "CANCELLED" && (
        <Button variant="outline" asChild>
          <Link href={`/orders/${invoice.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      )}

      {invoice.paymentStatus !== "PAID" && invoice.status !== "CANCELLED" && (
        <Button onClick={onRecordPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <CheckCircle className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Copy className="mr-2 h-4 w-4" /> Duplicate Invoice
          </DropdownMenuItem>
          
          {invoice.status !== "CANCELLED" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCancel} className="text-red-600 focus:text-red-700">
                <XCircle className="mr-2 h-4 w-4" /> Cancel Order
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
