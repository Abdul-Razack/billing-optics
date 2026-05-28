import { ApiInvoice } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

export function InvoicePreview({ invoice }: { invoice: ApiInvoice }) {
  return (
    <div className="bg-white text-black p-8 rounded-lg border shadow-sm max-w-3xl mx-auto font-sans">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">INVOICE</h1>
          <p className="text-gray-500 text-sm">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold text-gray-800">Billing Optics Inc.</h2>
          <p className="text-gray-500 text-sm">123 Optic Way, Vision City</p>
          <p className="text-gray-500 text-sm">contact@billingoptics.com</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b py-6 border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Bill To:</p>
          <p className="font-medium text-gray-800">{invoice.customerName || "Walk-in Customer"}</p>
          {invoice.customerId && <p className="text-gray-500 text-sm">ID: {invoice.customerId}</p>}
        </div>
        <div className="text-right">
          <div className="mb-2">
            <p className="text-xs text-gray-500 uppercase font-bold inline-block mr-2">Date:</p>
            <p className="font-medium text-gray-800 inline-block">
              {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold inline-block mr-2">Status:</p>
            <div className="inline-block"><PaymentStatusBadge status={invoice.paymentStatus} /></div>
          </div>
        </div>
      </div>

      <table className="w-full mb-8 text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 font-semibold text-gray-700 w-1/2">Item Description</th>
            <th className="py-3 font-semibold text-gray-700 text-right">Qty</th>
            <th className="py-3 font-semibold text-gray-700 text-right">Price</th>
            <th className="py-3 font-semibold text-gray-700 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines && invoice.lines.length > 0 ? (
            invoice.lines.map((line) => (
              <tr key={line.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4">
                  <p className="font-medium text-gray-800">{line.productName || `Item #${line.productId}`}</p>
                  {line.productSku && <p className="text-xs text-gray-500">{line.productSku}</p>}
                </td>
                <td className="py-4 text-right text-gray-700">{line.quantity}</td>
                <td className="py-4 text-right text-gray-700">{formatCurrency(line.unitPrice)}</td>
                <td className="py-4 text-right font-medium text-gray-800">{formatCurrency(line.subtotal)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500 italic">No line items available</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="w-full md:w-1/2 ml-auto">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>Tax</span>
          <span>{formatCurrency(invoice.taxTotal)}</span>
        </div>
        {invoice.discountTotal > 0 && (
          <div className="flex justify-between py-2 text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(invoice.discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2 font-bold text-lg text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(invoice.grandTotal)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600 font-medium">
          <span>Amount Paid</span>
          <span>{formatCurrency(invoice.amountPaid)}</span>
        </div>
        <div className="flex justify-between py-2 bg-gray-50 px-2 rounded mt-2 font-bold text-gray-800">
          <span>Balance Due</span>
          <span>{formatCurrency(invoice.grandTotal - invoice.amountPaid)}</span>
        </div>
      </div>
    </div>
  );
}
