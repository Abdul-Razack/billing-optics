import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface StockMovement {
  id: number;
  date: string;
  productName: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reference: string;
}

export function StockMovementReport({ movements }: { movements: StockMovement[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Stock Movement</CardTitle>
        <CardDescription>Recent inventory inflows and outflows</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="text-muted-foreground">{new Date(movement.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{movement.productName}</TableCell>
                <TableCell>
                  <Badge 
                    variant={movement.type === "IN" ? "default" : movement.type === "OUT" ? "secondary" : "outline"}
                    className={
                      movement.type === "IN" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" :
                      movement.type === "OUT" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                      ""
                    }
                  >
                    {movement.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  <span className={movement.type === "OUT" ? "text-red-500" : "text-emerald-600"}>
                    {movement.type === "OUT" ? "-" : "+"}{movement.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs">{movement.reference}</TableCell>
              </TableRow>
            ))}
            {movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No stock movement history available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
