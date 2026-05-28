import { ApiInvoice } from "@/types/order";
import { OrderStatusBadge } from "../OrderStatusBadge";
import { PaymentStatusBadge } from "../PaymentStatusBadge";
import { CalendarIcon, FileTextIcon } from "lucide-react";

export function OrderHeader({ invoice }: { invoice: ApiInvoice }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border shadow-sm">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FileTextIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <OrderStatusBadge status={invoice.status || "COMPLETED"} />
          <PaymentStatusBadge status={invoice.paymentStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            <span>Created: {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          {invoice.dueDate && (
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span>Due: {new Date(invoice.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
