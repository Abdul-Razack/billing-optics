"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueLineChartProps {
  data: { label: string; sales: number }[];
  title?: string;
}

export function RevenueLineChart({ data, title = "Revenue Trend" }: RevenueLineChartProps) {
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
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
              tickFormatter={(value) => `₹${value.toLocaleString()}`} 
              dx={-10}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#8b5cf6" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#8b5cf6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
