import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface TopCustomerRow {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  orderCount: number;
  revenue: number;
  lastPurchase: string;
}

export function TopCustomersAnalytics({ customers }: { customers: TopCustomerRow[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Top Customers Analytics</CardTitle>
        <CardDescription>Highest lifetime value customers</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead className="text-center">Last Purchase</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      {customer.email && <span className="text-xs text-muted-foreground">{customer.email}</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{customer.orderCount}</Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {new Date(customer.lastPurchase).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right font-semibold text-emerald-600">
                  {formatCurrency(customer.revenue)}
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No customer data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
