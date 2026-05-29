import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiInvoice } from "@/types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown, Copy, Printer, Download } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface OrderTableProps {
  orders: ApiInvoice[];
  onDelete?: (id: number) => void;
  selectedIds: number[];
  onSelectToggle: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function OrderTable({ 
  orders, 
  onDelete,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort
}: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-md bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Found</h3>
        <p className="text-sm text-muted-foreground">There are no orders matching your criteria.</p>
      </div>
    );
  }

  const allSelected = orders.length > 0 && selectedIds.length === orders.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < orders.length;

  const SortableHeader = ({ column, label, align = "left" }: { column: string, label: string, align?: "left" | "right" }) => (
    <TableHead className={align === "right" ? "text-right" : ""}>
      <Button 
        variant="ghost" 
        onClick={() => onSort(column)}
        className={`h-8 px-2 -ml-2 hover:bg-muted/50 ${align === "right" ? "ml-auto" : ""}`}
      >
        {label}
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    </TableHead>
  );

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all"
              />
            </TableHead>
            <SortableHeader column="date" label="Invoice / Date" />
            <SortableHeader column="customer" label="Customer" />
            <TableHead className="text-center">Items</TableHead>
            <SortableHeader column="amount" label="Total Amount" align="right" />
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const isSelected = selectedIds.includes(order.id);
            return (
              <TableRow 
                key={order.id} 
                className={`hover:bg-muted/50 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
              >
                <TableCell>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onSelectToggle(order.id)}
                    aria-label={`Select order ${order.invoiceNumber}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{order.invoiceNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customerName || "Walk-in Customer"}</span>
                    {order.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(order.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-medium">{order.itemCount || 0}</span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.grandTotal)}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status || "COMPLETED"} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Order
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => {}}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </DropdownMenuItem>

                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(order.id)}
                              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
