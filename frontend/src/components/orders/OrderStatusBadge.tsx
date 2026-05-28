import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types/order";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "COMPLETED":
      return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Completed</Badge>;
    case "DRAFT":
      return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20">Draft</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/20">Cancelled</Badge>;
    case "REFUNDED":
      return <Badge className="bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-500/20">Refunded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
