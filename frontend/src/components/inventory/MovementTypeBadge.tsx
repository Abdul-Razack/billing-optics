import { Badge } from "@/components/ui/badge";

export function MovementTypeBadge({ type }: { type: string }) {
  switch (type.toUpperCase()) {
    case "PURCHASE":
      return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Purchase (+)</Badge>;
    case "SALE":
      return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20">Sale (-)</Badge>;
    case "RETURN":
      return <Badge className="bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-500/20">Return (+)</Badge>;
    case "ADJUSTMENT":
      return <Badge className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 border-purple-500/20">Adjustment</Badge>;
    // Legacy mock types fallback
    case "ADD":
      return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20">Added (+)</Badge>;
    case "REDUCE":
      return <Badge className="bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-500/20">Reduced (-)</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}
