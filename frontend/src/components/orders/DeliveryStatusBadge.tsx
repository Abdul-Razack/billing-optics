import { Badge } from "@/components/ui/badge";
import { DeliveryStatus } from "@/types/order";

export function DeliveryStatusBadge({ status }: { status?: DeliveryStatus }) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;

  switch (status) {
    case "DELIVERED":
      return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Delivered</Badge>;
    case "READY":
      return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20">Ready</Badge>;
    case "PENDING":
      return <Badge className="bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-500/20">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
