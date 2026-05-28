import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiInvoice } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Calendar, User, ShoppingBag } from "lucide-react";

export function OrderCard({ order }: { order: ApiInvoice }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.invoiceNumber}</CardTitle>
            <CardDescription className="flex items-center mt-1 text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              {new Date(order.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <OrderStatusBadge status={order.status || "COMPLETED"} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            <span className="font-medium text-foreground mr-1">Customer:</span>
            {order.customerName || "Walk-in Customer"}
          </div>
          <div className="flex items-center text-muted-foreground">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span className="font-medium text-foreground mr-1">Items:</span>
            {order.lines?.length || 0}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t bg-muted/20 flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">Total</span>
        <span className="text-lg font-bold text-primary">{formatCurrency(order.grandTotal)}</span>
      </CardFooter>
    </Card>
  );
}
