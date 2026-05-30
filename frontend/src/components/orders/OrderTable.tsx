import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiInvoice } from "@/types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown, Copy, Printer, Download, Truck } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { handleRowClick } from "@/lib/table-utils";
import { ExportService } from "@/services/export.service";
import { toast } from "sonner";

interface SortableHeaderProps {
  column: string;
  label: string;
  align?: "left" | "right";
  onSort: (column: string) => void;
}

function SortableHeader({ column, label, align = "left", onSort }: SortableHeaderProps) {
  return (
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
}

interface OrderTableProps {
  orders: ApiInvoice[];
  onDelete?: (id: number) => void;
  onDeliveryStatusChange?: (id: number, status: "PENDING" | "READY" | "DELIVERED") => void;
  selectedIds?: number[];
  onSelectToggle?: (id: number) => void;
  onSelectAll?: (checked: boolean) => void;
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function OrderTable({ 
  orders, 
  onDelete,
  onDeliveryStatusChange,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort
}: OrderTableProps) {
  const router = useRouter();

  const handleDownloadPdf = async (invoiceId: string | number) => {
    const toastId = toast.loading("Generating PDF from server...");
    try {
      await ExportService.exportInvoicePdf(invoiceId);
      toast.success("PDF downloaded successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-md bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Found</h3>
        <p className="text-sm text-muted-foreground">There are no orders matching your criteria.</p>
      </div>
    );
  }

  const allSelected = orders.length > 0 && selectedIds && selectedIds.length === orders.length;
  const someSelected = selectedIds && selectedIds.length > 0 && selectedIds.length < orders.length;
  const showSelection = !!onSelectToggle && !!selectedIds;

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {showSelection && (
              <TableHead className="w-12">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            <SortableHeader column="date" label="Invoice / Date" onSort={onSort} />
            <SortableHeader column="customer" label="Customer" onSort={onSort} />
            <TableHead className="text-center">Items</TableHead>
            <SortableHeader column="amount" label="Total Amount" align="right" onSort={onSort} />
            <TableHead>Payment</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const isSelected = selectedIds?.includes(order.id) || false;
            return (
              <TableRow 
                key={order.id} 
                className={`hover:bg-muted/50 cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                tabIndex={0}
                onClick={(e) => handleRowClick(e, router, `/orders/${order.id}`)}
                onKeyDown={(e) => handleRowClick(e, router, `/orders/${order.id}`)}
              >
                {showSelection && (
                  <TableCell>
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => onSelectToggle?.(order.id)}
                      aria-label={`Select order ${order.invoiceNumber}`}
                    />
                  </TableCell>
                )}
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
                  <DeliveryStatusBadge status={order.deliveryStatus} />
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
                        
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDownloadPdf(order.id);
                        }}>
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </DropdownMenuItem>

                        {onDeliveryStatusChange && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDeliveryStatusChange(order.id, 'PENDING')}>
                              <Truck className="mr-2 h-4 w-4" /> Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeliveryStatusChange(order.id, 'READY')}>
                              <Truck className="mr-2 h-4 w-4 text-blue-500" /> Mark as Ready
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeliveryStatusChange(order.id, 'DELIVERED')}>
                              <Truck className="mr-2 h-4 w-4 text-emerald-500" /> Mark as Delivered
                            </DropdownMenuItem>
                          </>
                        )}

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
