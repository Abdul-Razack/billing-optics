import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function OrderSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice / Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24 mb-2" /><div className="h-3 bg-muted rounded animate-pulse w-16" /></TableCell>
              <TableCell><div className="h-4 bg-muted rounded animate-pulse w-32" /></TableCell>
              <TableCell className="text-right"><div className="h-4 bg-muted rounded animate-pulse w-16 ml-auto" /></TableCell>
              <TableCell><div className="h-6 bg-muted rounded-full animate-pulse w-20" /></TableCell>
              <TableCell><div className="h-6 bg-muted rounded-full animate-pulse w-20" /></TableCell>
              <TableCell className="text-right"><div className="h-8 bg-muted rounded animate-pulse w-8 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
