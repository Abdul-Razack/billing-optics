import { Badge } from "@/components/ui/badge";
import { AlertSeverity } from "@/lib/alerts";

interface AlertSeverityBadgeProps {
  severity: AlertSeverity;
}

export function AlertSeverityBadge({ severity }: AlertSeverityBadgeProps) {
  switch (severity) {
    case "WARNING":
      return <Badge className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-500/20">Warning</Badge>;
    case "CRITICAL":
      return <Badge className="bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-500/20">Critical</Badge>;
    case "EMERGENCY":
      return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/20">Emergency</Badge>;
    default:
      return <Badge variant="outline">OK</Badge>;
  }
}
