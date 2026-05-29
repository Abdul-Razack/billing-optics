import { forwardRef } from "react";
import { Invoice } from "@/types/invoice";
import { Customer } from "@/types/customer";

export interface PrintableReceiptProps {
  invoice: Invoice;
  customer?: Customer;
}

export const PrintableReceipt = forwardRef<HTMLDivElement, PrintableReceiptProps>(
  ({ invoice, customer }, ref) => {
    return (
      <div 
        ref={ref}
        className="hidden print:block bg-white text-black font-mono w-[80mm] max-w-full mx-auto pb-8"
        style={{ color: "#000", fontSize: "12px", lineHeight: "1.4" }}
      >
        {/* Header */}
        <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
          <h1 className="text-xl font-bold uppercase mb-1">Billing Optics</h1>
          <p className="text-xs">123 Optic Way, Vision City</p>
          <p className="text-xs">Ph: +1 (555) 123-4567</p>
          <p className="text-xs mt-1">TAX ID: BO-987654321</p>
        </div>

        {/* Invoice Info */}
        <div className="mb-4 text-xs space-y-1 border-b border-black pb-4 border-dashed">
          <div className="flex justify-between">
            <span className="font-bold">Receipt #:</span>
            <span>{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Date:</span>
            <span>{new Date(invoice.date).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Customer:</span>
            <span>{customer?.fullName || "Walk-in"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Status:</span>
            <span className="uppercase">{invoice.paymentStatus}</span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-4 border-b border-black pb-4 border-dashed">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black/50">
                <th className="text-left py-1 font-bold">Item</th>
                <th className="text-right py-1 font-bold">Qty</th>
                <th className="text-right py-1 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-2">
                    <div className="font-medium line-clamp-2">{item.productName}</div>
                    <div className="text-[10px] text-gray-600">@ ${item.unitPrice.toFixed(2)}</div>
                  </td>
                  <td className="py-2 text-right align-top">{item.quantity}</td>
                  <td className="py-2 text-right align-top font-medium">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-6 space-y-1 text-xs border-b border-black pb-4 border-dashed">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountTotal > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-${invoice.discountTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax (GST):</span>
            <span>${invoice.gstTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-black/50">
            <span>TOTAL:</span>
            <span>${invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs space-y-2">
          <p className="font-bold uppercase">Thank you for your business!</p>
          <p className="text-[10px] text-gray-500">Please retain this receipt for your records. Returns accepted within 15 days.</p>
        </div>
        
        {/* Style tag for print specific rules */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              margin: 0;
              size: 80mm 297mm;
            }
            body {
              margin: 0;
              padding: 4mm;
              width: 80mm;
            }
          }
        `}} />
      </div>
    );
  }
);

PrintableReceipt.displayName = "PrintableReceipt";
