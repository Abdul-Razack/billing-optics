import { forwardRef } from "react";
import { ApiInvoice } from "@/types/order";
import { ApiCustomer } from "@/types/customer";
import { formatCurrency } from "@/lib/utils";
import { InvoiceLineItem } from "../InvoiceLineItems";

export interface PrintableInvoiceProps {
  invoice: ApiInvoice;
  customer: ApiCustomer | null;
  lineItems: InvoiceLineItem[];
  settings?: any;
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice, customer, lineItems, settings }, ref) => {
    return (
      <div 
        ref={ref} 
        className="bg-white text-black font-mono w-[80mm] max-w-[80mm] mx-auto box-border relative print:p-0 print:m-0 text-[12px] leading-tight"
        style={{ color: "#000" }}
      >
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
        
        <div className="p-2 sm:p-4 pb-8">
          {/* Header Section */}
          <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
            <h1 className="text-lg font-bold uppercase mb-1">{settings?.businessName || "Billing Optics"}</h1>
            <p className="text-[10px]">{settings?.address || "123 Optic Way, Vision City"}</p>
            <p className="text-[10px]">Ph: {settings?.phone || "+1 (555) 123-4567"}</p>
            <p className="text-[10px]">TAX ID: {settings?.gstNumber || "BO-987654321"}</p>
          </div>

          {/* Meta Info */}
          <div className="mb-3 text-[11px] space-y-1 border-b border-black pb-2 border-dashed">
            <div className="flex justify-between">
              <span className="font-bold">Receipt #:</span>
              <span>{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Date:</span>
              <span>{new Date(invoice.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Customer:</span>
              <span>{customer?.fullName || invoice.customerName || "Walk-in"}</span>
            </div>
            {customer?.phone && (
              <div className="flex justify-between">
                <span className="font-bold">Phone:</span>
                <span>{customer.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-bold">Status:</span>
              <span className="uppercase">{invoice.paymentStatus}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-3 border-b border-black pb-2 border-dashed">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-black/50">
                  <th className="text-left py-1 font-bold">Item</th>
                  <th className="text-right py-1 font-bold">Qty</th>
                  <th className="text-right py-1 font-bold">Price</th>
                  <th className="text-right py-1 font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {lineItems.length > 0 ? (
                  lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-black/10 last:border-0">
                      <td className="py-1 pr-1 break-words max-w-[35mm]">
                        <div className="font-medium leading-[1.2]">{item.product.name}</div>
                        {item.product.sku && <div className="text-[9px] text-gray-600">{item.product.sku}</div>}
                      </td>
                      <td className="py-1 text-right">{item.quantity}</td>
                      <td className="py-1 text-right">{formatCurrency(item.product.sellingPrice)}</td>
                      <td className="py-1 text-right font-medium">
                        {formatCurrency(item.product.sellingPrice * item.quantity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-2 text-center italic">No items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mb-3 space-y-1 text-[11px] border-b border-black pb-2 border-dashed">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (GST):</span>
              <span>{formatCurrency(invoice.taxTotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold mt-1 pt-1 border-t border-black/50">
              <span>TOTAL:</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
            
            <div className="flex justify-between mt-1 text-gray-700">
              <span>Amount Paid:</span>
              <span>{formatCurrency(invoice.amountPaid)}</span>
            </div>
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="text-[9px] text-gray-500 text-right mt-0.5">
                via {invoice.payments.map(p => p.paymentMethod).join(", ")}
              </div>
            )}
            {invoice.grandTotal - invoice.amountPaid > 0 && (
              <div className="flex justify-between font-bold mt-1">
                <span>BALANCE DUE:</span>
                <span>{formatCurrency(Math.max(0, invoice.grandTotal - invoice.amountPaid))}</span>
              </div>
            )}
          </div>

          {/* Notes & Terms */}
          <div className="text-center text-[10px] space-y-1">
            <p className="font-bold uppercase text-[11px]">Thank you for your business!</p>
            <p className="text-gray-600 leading-tight">Please retain this receipt for your records. Returns accepted within 15 days.</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableInvoice.displayName = "PrintableInvoice";
