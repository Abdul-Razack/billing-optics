import { Badge } from "@/components/ui/badge";

export function CustomerStatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20">
      Inactive
    </Badge>
  );
}
