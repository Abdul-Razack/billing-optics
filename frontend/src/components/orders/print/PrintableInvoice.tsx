import { forwardRef } from "react";
import { ApiInvoice } from "@/types/order";
import { ApiCustomer } from "@/types/customer";
import { formatCurrency } from "@/lib/utils";
import { InvoiceLineItem } from "../InvoiceLineItems";

export interface PrintableInvoiceProps {
  invoice: ApiInvoice;
  customer: ApiCustomer | null;
  lineItems: InvoiceLineItem[];
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice, customer, lineItems }, ref) => {
    return (
      <div 
        ref={ref} 
        className="bg-white text-black p-10 font-sans w-[210mm] min-h-[297mm] mx-auto box-border relative"
        style={{ color: "#000" }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12 border-b-2 border-gray-900 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">INVOICE</h1>
            <p className="text-lg text-gray-600 font-medium">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Billing Optics Inc.</h2>
            <p className="text-sm text-gray-600">123 Optic Way, Vision City</p>
            <p className="text-sm text-gray-600">contact@billingoptics.com</p>
            <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
            <p className="text-sm text-gray-600 mt-2 font-semibold">TAX ID: BO-987654321</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-10 mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
            <p className="text-lg font-bold text-gray-900 mb-1">{customer?.fullName || invoice.customerName || "Walk-in Customer"}</p>
            {customer && (
              <>
                {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
                {customer.address && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{customer.address}</p>}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="text-gray-500 font-medium">Invoice Date:</div>
            <div className="font-semibold text-right text-gray-900">
              {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="text-gray-500 font-medium">Due Date:</div>
            <div className="font-semibold text-right text-gray-900">
              {invoice.dueDate 
                ? new Date(invoice.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                : "Upon Receipt"}
            </div>
            
            <div className="text-gray-500 font-medium">Payment Status:</div>
            <div className="font-semibold text-right text-gray-900">{invoice.paymentStatus}</div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-10 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-300">
              <th className="py-3 px-4 text-left text-sm font-bold text-gray-900 w-[50%]">Description</th>
              <th className="py-3 px-4 text-right text-sm font-bold text-gray-900">Qty</th>
              <th className="py-3 px-4 text-right text-sm font-bold text-gray-900">Unit Price</th>
              <th className="py-3 px-4 text-right text-sm font-bold text-gray-900">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lineItems.length > 0 ? (
              lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    <p className="font-medium">{item.product.name}</p>
                    {item.product.sku && <p className="text-xs text-gray-500">{item.product.sku}</p>}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.product.sellingPrice)}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.product.sellingPrice * item.quantity)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-500 italic">No items found in this invoice.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-gray-600 px-4">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="flex justify-between text-sm text-gray-600 px-4">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600 px-4">
              <span>Tax</span>
              <span>{formatCurrency(invoice.taxTotal)}</span>
            </div>
            
            <div className="flex justify-between items-center text-base font-bold text-gray-900 border-t border-gray-900 pt-3 px-4 mt-3">
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 px-4 pt-2">
              <span>Amount Paid</span>
              <span>{formatCurrency(invoice.amountPaid)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-gray-100 p-4 mt-2">
              <span className="font-bold text-gray-900">Balance Due</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(Math.max(0, invoice.grandTotal - invoice.amountPaid))}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="mt-auto pt-10 border-t border-gray-200">
          {invoice.notes ? (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          ) : null}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Terms & Conditions</h4>
            <p className="text-xs text-gray-500">
              Please pay within 15 days of receiving this invoice. There will be a 1.5% interest charge per month on late invoices.
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 right-10 text-center text-xs text-gray-400">
          Generated by Billing Optics ERP • Page 1 of 1
        </div>
      </div>
    );
  }
);

PrintableInvoice.displayName = "PrintableInvoice";
