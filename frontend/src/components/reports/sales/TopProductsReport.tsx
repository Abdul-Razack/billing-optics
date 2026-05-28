import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface TopProduct {
  id: number;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
}

export function TopProductsReport({ products }: { products: TopProduct[] }) {
  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Highest selling products by volume</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Units</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[150px]">{product.name}</span>
                    <span className="text-xs text-muted-foreground">{product.sku}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{product.unitsSold}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-emerald-600">
                  {formatCurrency(product.revenue)}
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No product data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
