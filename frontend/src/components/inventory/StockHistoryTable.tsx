import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryLedgerRecord } from "@/services/inventory.service";
import { MovementTypeBadge } from "./MovementTypeBadge";
import { ArrowRight, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockHistoryTableProps {
  movements: InventoryLedgerRecord[];
  isLoading: boolean;
}

export function StockHistoryTable({ movements, isLoading }: StockHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date / ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Movement</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24 mb-2" /><div className="h-3 bg-muted rounded animate-pulse w-16" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" /><div className="h-3 bg-muted rounded animate-pulse w-1/2" /></TableCell>
                <TableCell><div className="h-6 bg-muted rounded-full animate-pulse w-20" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse w-32" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-md">
        <h3 className="text-lg font-semibold text-foreground mb-2">No History Found</h3>
        <p className="text-sm text-muted-foreground">There are no stock movements matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Date / ID</TableHead>
            <TableHead>Product Info</TableHead>
            <TableHead>Movement Type</TableHead>
            <TableHead>Quantity Flow</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Performed By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id} className="hover:bg-muted/50 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {new Date(movement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-xs text-muted-foreground">Ledger #{movement.id}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{movement.product?.name || "Unknown"}</span>
                  <span className="text-xs text-muted-foreground">{movement.product?.sku || "N/A"}</span>
                </div>
              </TableCell>
              <TableCell>
                <MovementTypeBadge type={movement.movementType} />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {movement.quantityChange > 0 ? (
                    <ArrowUp className="h-3 w-3 text-emerald-600" />
                  ) : movement.quantityChange < 0 ? (
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  ) : null}
                  <span className={cn(
                    "font-medium", 
                    movement.quantityChange > 0 ? "text-emerald-600" : 
                    movement.quantityChange < 0 ? "text-red-600" : "text-gray-600"
                  )}>
                    {movement.quantityChange > 0 ? "+" : ""}{movement.quantityChange}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{movement.notes || "-"}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{movement.creator?.fullName || "System"}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
