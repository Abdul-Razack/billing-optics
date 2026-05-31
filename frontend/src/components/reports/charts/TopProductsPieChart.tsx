"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TopProductsPieChartProps {
  data: { name: string; revenue: number }[];
  title?: string;
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export function TopProductsPieChart({ data, title = "Top Products by Revenue" }: TopProductsPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="w-full h-80 bg-muted/30 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="revenue"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
