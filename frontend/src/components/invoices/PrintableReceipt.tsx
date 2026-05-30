import { forwardRef } from "react";
import { ApiInvoice } from "@/types/order";
import { ApiCustomer } from "@/types/customer";

export interface PrintableReceiptProps {
  invoice: ApiInvoice;
  customer?: ApiCustomer | null;
  lineItems?: Array<any>;
  settings?: any;
}

export const PrintableReceipt = forwardRef<HTMLDivElement, PrintableReceiptProps>(
  ({ invoice, customer, lineItems, settings }, ref) => {
    const itemsToRender = lineItems || invoice.lines || [];
    return (
      <div 
        ref={ref}
        className="hidden print:block bg-white text-black font-mono w-[80mm] max-w-[80mm] mx-auto box-border relative print:p-0 print:m-0"
        style={{ color: "#000", fontSize: "12px", lineHeight: "1.2" }}
      >
        {/* Header */}
        <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
          <h1 className="text-xl font-bold uppercase mb-1">{settings?.businessName || "Billing Optics"}</h1>
          <p className="text-xs whitespace-pre-wrap">{settings?.address || "123 Optic Way, Vision City"}</p>
          <p className="text-xs">Ph: {settings?.phone || "+1 (555) 123-4567"}</p>
          <p className="text-xs mt-1">TAX ID: {settings?.gstNumber || "BO-987654321"}</p>
        </div>

        {/* Invoice Info */}
        <div className="mb-4 text-xs space-y-1 border-b border-black pb-4 border-dashed">
          <div className="flex justify-between">
            <span className="font-bold">Receipt #:</span>
            <span>{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Date:</span>
            <span>{new Date(invoice.createdAt || Date.now()).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Customer:</span>
            <span>{customer?.fullName || invoice.customerName || "Walk-in"}</span>
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
              {itemsToRender.map((item, idx) => {
                const isLineItem = !!item.product;
                const name = isLineItem ? item.product.name : item.productName;
                const price = isLineItem ? item.product.sellingPrice : item.unitPrice;
                const qty = item.quantity;
                const total = isLineItem ? price * qty : item.total;
                return (
                  <tr key={item.id || idx}>
                    <td className="py-2 pr-2">
                      <div className="font-medium line-clamp-2">{name}</div>
                      <div className="text-[10px] text-gray-600">@ ${Number(price).toFixed(2)}</div>
                    </td>
                    <td className="py-2 text-right align-top">{qty}</td>
                    <td className="py-2 text-right align-top font-medium">
                      ${Number(total).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
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
          <div className="flex justify-between mt-1 text-gray-700">
            <span>AMOUNT PAID:</span>
            <span>${(invoice.amountPaid || 0).toFixed(2)}</span>
          </div>
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="text-[9px] text-gray-500 text-right mt-0.5">
              via {invoice.payments.map(p => p.method).join(", ")}
            </div>
          )}
          {invoice.grandTotal - (invoice.amountPaid || 0) > 0 && (
            <div className="flex justify-between font-bold mt-1 text-sm">
              <span>BALANCE DUE:</span>
              <span>${(invoice.grandTotal - (invoice.amountPaid || 0)).toFixed(2)}</span>
            </div>
          )}
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
              size: 80mm auto;
            }
            body {
              margin: 0;
              padding: 0;
              width: 80mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}} />
      </div>
    );
  }
);

PrintableReceipt.displayName = "PrintableReceipt";
