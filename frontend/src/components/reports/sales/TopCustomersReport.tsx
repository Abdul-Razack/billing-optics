import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface TopCustomerReportData {
  id: number;
  name: string;
  orderCount: number;
  revenue: number;
}

export function TopCustomersReport({ customers }: { customers: TopCustomerReportData[] }) {
  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
        <CardDescription>Highest revenue generating customers</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate max-w-[120px]">{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{customer.orderCount}</TableCell>
                <TableCell className="text-right font-semibold text-emerald-600">
                  {formatCurrency(customer.revenue)}
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
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
