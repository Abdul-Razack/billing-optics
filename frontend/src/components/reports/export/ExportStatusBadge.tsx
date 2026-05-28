import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

export type ExportStatus = "pending" | "processing" | "completed" | "failed";

export function ExportStatusBadge({ status }: { status: ExportStatus }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-muted-foreground bg-gray-50 border-gray-200">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary" className="text-blue-600 bg-blue-50 hover:bg-blue-50">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-50">
          <AlertCircle className="mr-1 h-3 w-3" /> Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
