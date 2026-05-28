import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/order";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Paid</Badge>;
    case "PARTIAL":
      return <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20">Partial</Badge>;
    case "UNPAID":
      return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/20">Unpaid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
