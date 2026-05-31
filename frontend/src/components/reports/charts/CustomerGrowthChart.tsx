"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CustomerGrowthChartProps {
  data: { label: string; customers: number }[];
  title?: string;
}

export function CustomerGrowthChart({ data, title = "Customer Acquisition Trend" }: CustomerGrowthChartProps) {
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
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              dx={-10}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: any) => [Number(value), "New Customers"]}
            />
            <Area
              type="monotone"
              dataKey="customers"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCustomers)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
