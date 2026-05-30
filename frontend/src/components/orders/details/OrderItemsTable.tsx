import { ApiInvoiceLine } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageIcon } from "lucide-react";

interface OrderItemsTableProps {
  lines: ApiInvoiceLine[];
}

export function OrderItemsTable({ lines }: OrderItemsTableProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <PackageIcon className="h-5 w-5" />
          Order Items
        </h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[40%]">Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right font-semibold">Line Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!lines || lines.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  No items found in this order.
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line) => {
                const productName = line.productName || `Product ID: ${line.productId}`;
                const sku = line.productSku;
                
                return (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{productName}</div>
                      {sku && <div className="text-xs text-gray-500 mt-1">SKU: {sku}</div>}
                    </TableCell>
                    <TableCell className="text-right">{line.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                    <TableCell className="text-right text-gray-500">-</TableCell>
                    <TableCell className="text-right text-gray-500">-</TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatCurrency(line.subtotal)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
