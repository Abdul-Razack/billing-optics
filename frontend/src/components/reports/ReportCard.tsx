import { LucideIcon } from "lucide-react";

interface ReportCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function ReportCard({ title, value, description, icon: Icon, trend }: ReportCardProps) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {(description || trend) && (
        <div className="mt-auto pt-4 flex items-center gap-2 text-sm">
          {trend && (
            <span className={`font-medium ${trend.positive ? "text-green-600" : "text-red-600"}`}>
              {trend.positive ? "+" : "-"}{trend.value}
            </span>
          )}
          {description && (
            <span className="text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
