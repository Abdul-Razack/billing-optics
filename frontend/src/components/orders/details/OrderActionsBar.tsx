"use client";

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
import { useRouter } from "next/navigation";
import { OrderService } from "@/services/order.service";

export function OrderActionsBar({ invoice, onRecordPayment }: { invoice: ApiInvoice, onRecordPayment: () => void }) {
  const router = useRouter();
  
  const handlePrint = () => {
    window.print();
  };

  const handleVoid = async () => {
    if (!window.confirm("Are you sure you want to void this invoice? This will restore inventory and mark payments as refunded.")) return;
    
    try {
      await OrderService.voidOrder(invoice.id);
      toast.success("Invoice voided successfully");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Failed to void invoice");
    }
  };

  const handleDuplicate = () => {
    const lineItems = (invoice.lines || []).map(line => ({
      product: {
        id: line.productId,
        name: line.productName || `Item ${line.productId}`,
        sku: line.productSku || "",
        sellingPrice: line.unitPrice,
        gstPercent: line.gstPercent || 0
      },
      quantity: line.quantity
    }));

    localStorage.setItem("order_cart_draft", JSON.stringify({
      customerId: invoice.customerId,
      lineItems,
      paymentMethod: "CASH",
      amountPaid: 0,
      referenceNumber: ""
    }));
    
    router.push(invoice.customerId ? `/orders/create?customerId=${invoice.customerId}` : '/orders/create');
  };

  const isVoided = invoice.paymentStatus === 'REFUNDED' || (invoice.notes && invoice.notes.includes('[VOIDED]'));

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      
      {!isVoided && invoice.status !== "CANCELLED" && (
        <Button variant="outline" asChild>
          <Link href={`/orders/${invoice.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      )}

      {!isVoided && invoice.paymentStatus !== "PAID" && invoice.status !== "CANCELLED" && (
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
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" /> Duplicate Invoice
          </DropdownMenuItem>
          
          {!isVoided && invoice.status !== "CANCELLED" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleVoid} className="text-red-600 focus:text-red-700">
                <XCircle className="mr-2 h-4 w-4" /> Void Invoice
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
