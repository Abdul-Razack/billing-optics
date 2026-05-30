import { forwardRef } from "react";
import { ApiCustomer } from "@/types/customer";

interface ReceiptItem {
  id?: string | number;
  productName?: string;
  name?: string;
  unitPrice?: number;
  sellingPrice?: number;
  quantity: number;
  total?: number;
  subtotal?: number;
  product?: { name: string; sellingPrice: number };
}

interface ReceiptInvoice {
  invoiceNumber?: string;
  createdAt?: string;
  date?: string;
  customerName?: string;
  paymentStatus?: string;
  lines?: ReceiptItem[];
  items?: ReceiptItem[];
  subtotal?: number;
  gstTotal?: number;
  taxTotal?: number;
  discountTotal?: number;
  grandTotal?: number;
  amountPaid?: number;
  payments?: Array<{ method?: string; paymentMethod?: string }>;
}

export interface PrintableReceiptProps {
  invoice: ReceiptInvoice;
  customer?: ApiCustomer | null;
  lineItems?: ReceiptItem[];
  settings?: any;
}

export const PrintableReceipt = forwardRef<HTMLDivElement, PrintableReceiptProps>(
  ({ invoice, customer, lineItems, settings }, ref) => {
    const itemsToRender: ReceiptItem[] = lineItems || invoice.items || invoice.lines || [];

    const fmt = (n: number | undefined | null) => Number(n || 0).toFixed(2);

    const subtotal = invoice.subtotal || 0;
    const gstTotal = invoice.gstTotal || invoice.taxTotal || 0;
    const discountTotal = invoice.discountTotal || 0;
    const grandTotal = invoice.grandTotal || 0;
    const amountPaid = invoice.amountPaid || 0;
    const balanceDue = grandTotal - amountPaid;

    const payments = invoice.payments || [];

    return (
      <div
        ref={ref}
        className="hidden print:block bg-white text-black font-mono mx-auto box-border"
        style={{ color: "#000", fontSize: "11px", lineHeight: "1.4", width: "80mm", maxWidth: "80mm" }}
      >
        {/* ── Header ── */}
        <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "2px" }}>
            {settings?.businessName || "OPTICS POS"}
          </div>
          <div>{settings?.address || "123 Optic Way, Vision City"}</div>
          <div>Ph: {settings?.phone || "+1 (555) 123-4567"}</div>
          <div>TAX ID: {settings?.gstNumber || "BO-987654321"}</div>
        </div>

        {/* ── Invoice Info ── */}
        <div style={{ borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
          {[
            ["Receipt #:", invoice.invoiceNumber],
            ["Date:", new Date(invoice.createdAt || invoice.date || Date.now()).toLocaleString()],
            ["Customer:", customer?.fullName || invoice.customerName || "Walk-in"],
            ["Status:", (invoice.paymentStatus || "").toUpperCase()],
          ].map(([label, value]) => (
            <div key={label as string} style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>{label}</span>
              <span style={{ textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Items Table ── */}
        <div style={{ borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "55%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "33%" }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <th style={{ textAlign: "left", padding: "2px 4px 2px 0", fontWeight: "bold" }}>Item</th>
                <th style={{ textAlign: "right", padding: "2px 4px", fontWeight: "bold" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "2px 0 2px 4px", fontWeight: "bold" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender.map((item, idx) => {
                const hasProduct = !!item.product;
                const name = hasProduct ? item.product!.name : (item.productName || item.name || "—");
                const price = hasProduct ? item.product!.sellingPrice : (item.unitPrice || item.sellingPrice || 0);
                const qty = item.quantity || 0;
                const total = hasProduct ? price * qty : (item.total || item.subtotal || price * qty || 0);
                return (
                  <tr key={item.id ?? idx}>
                    <td style={{ padding: "4px 4px 4px 0", verticalAlign: "top" }}>
                      <div style={{ fontWeight: "500", wordBreak: "break-word" }}>{name}</div>
                      <div style={{ fontSize: "9px", color: "#555" }}>@ ${fmt(price)}</div>
                    </td>
                    <td style={{ textAlign: "right", padding: "4px", verticalAlign: "top" }}>{qty}</td>
                    <td style={{ textAlign: "right", padding: "4px 0 4px 4px", verticalAlign: "top", fontWeight: "500" }}>
                      ${fmt(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Totals ── */}
        <div style={{ borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
          {[
            ["Subtotal:", `$${fmt(subtotal)}`],
            ...(discountTotal > 0 ? [["Discount:", `-$${fmt(discountTotal)}`]] : []),
            ["Tax (GST):", `$${fmt(gstTotal)}`],
          ].map(([label, value]) => (
            <div key={label as string} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px", borderTop: "1px solid #000", marginTop: "4px", paddingTop: "4px" }}>
            <span>TOTAL:</span>
            <span>${fmt(grandTotal)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
            <span>AMOUNT PAID:</span>
            <span>${fmt(amountPaid)}</span>
          </div>

          {payments.length > 0 && (
            <div style={{ fontSize: "9px", color: "#666", textAlign: "right" }}>
              via {payments.map(p => p.method || p.paymentMethod || "").join(", ")}
            </div>
          )}

          {balanceDue > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>
              <span>BALANCE DUE:</span>
              <span>${fmt(balanceDue)}</span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
            Thank you for your business!
          </div>
          <div style={{ fontSize: "9px", color: "#666" }}>
            Please retain this receipt for your records.{"\n"}Returns accepted within 15 days.
          </div>
        </div>

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
