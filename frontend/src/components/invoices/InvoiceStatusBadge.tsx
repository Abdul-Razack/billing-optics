import { Badge } from "@/components/ui/badge";
import { InvoiceStatus, PaymentStatus } from "@/types/invoice";

interface InvoiceStatusBadgeProps {
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  type: "invoice" | "payment";
}

export function InvoiceStatusBadge({ status, paymentStatus, type }: InvoiceStatusBadgeProps) {
  if (type === "invoice" && status) {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "DRAFT":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return null;
    }
  }

  if (type === "payment" && paymentStatus) {
    switch (paymentStatus) {
      case "PAID":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Paid</Badge>;
      case "PARTIAL":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>;
      case "PENDING":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>;
      default:
        return null;
    }
  }

  return null;
}
