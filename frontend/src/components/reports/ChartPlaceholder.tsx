import { BarChart3, LineChart, PieChart } from "lucide-react";

interface ChartPlaceholderProps {
  title: string;
  type?: "bar" | "line" | "pie";
  height?: string;
}

export function ChartPlaceholder({ title, type = "bar", height = "h-80" }: ChartPlaceholderProps) {
  const Icon = type === "bar" ? BarChart3 : type === "line" ? LineChart : PieChart;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className={`w-full ${height} bg-muted/30 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground`}>
        <Icon className="h-12 w-12 mb-3 text-muted-foreground/50" />
        <p className="text-sm font-medium">Chart Visualization Placeholder</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Implement with Recharts or Chart.js</p>
      </div>
    </div>
  );
}
