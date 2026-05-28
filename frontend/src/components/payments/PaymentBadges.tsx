import { Badge } from "@/components/ui/badge";
import { PaymentMethod, PaymentStatus } from "@/types/payment";
import { Banknote, CreditCard, Smartphone, Landmark } from "lucide-react";

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  switch (method) {
    case "CASH":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><Banknote className="mr-1 h-3 w-3" /> Cash</Badge>;
    case "CARD":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CreditCard className="mr-1 h-3 w-3" /> Card</Badge>;
    case "UPI":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><Smartphone className="mr-1 h-3 w-3" /> UPI</Badge>;
    case "BANK_TRANSFER":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><Landmark className="mr-1 h-3 w-3" /> Bank Transfer</Badge>;
    default:
      return null;
  }
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case "PENDING":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    case "REFUNDED":
      return <Badge variant="outline">Refunded</Badge>;
    default:
      return null;
  }
}
