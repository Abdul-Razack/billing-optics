import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { handleRowClick } from "@/lib/table-utils";

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  minStockAlert: number;
}

export function LowStockTable({ items }: { items: LowStockItem[] }) {
  const router = useRouter();
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Low Stock Alerts</CardTitle>
        <CardDescription>Products currently below their minimum stock threshold</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Current Stock</TableHead>
              <TableHead className="text-center">Min Alert</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isOutOfStock = item.stock <= 0;
              return (
                <TableRow 
                  key={item.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  tabIndex={0}
                  onClick={(e) => handleRowClick(e, router, `/products/${item.id}`)}
                  onKeyDown={(e) => handleRowClick(e, router, `/products/${item.id}`)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    <span className={isOutOfStock ? "text-red-600" : "text-amber-600"}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {item.minStockAlert}
                  </TableCell>
                  <TableCell className="text-right">
                    {isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        Low Stock
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  All products are sufficiently stocked.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
