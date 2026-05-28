import { Badge } from "@/components/ui/badge";
import { TransactionType } from "@/types/inventory";

interface TransactionTypeBadgeProps {
  type: TransactionType;
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  switch (type) {
    case "PURCHASE":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Purchase</Badge>;
    case "SALE":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Sale</Badge>;
    case "RETURN":
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Return</Badge>;
    case "ADJUSTMENT":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Adjustment</Badge>;
    default:
      return null;
  }
}
