"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryRevenueChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function CategoryRevenueChart({ data }: CategoryRevenueChartProps) {
  // Only show categories that have some revenue, or all if none do
  const chartData = data.filter(d => d.revenue > 0);
  const displayData = chartData.length > 0 ? chartData.slice(0, 10) : data.slice(0, 5); // Top 10 max

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Revenue by Category</h3>
        <p className="text-sm text-muted-foreground">Top performing categories by total revenue generated</p>
      </div>

      <div className="flex-1 min-h-0 w-full">
        {displayData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No revenue data available for categories
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `₹${(value / 100).toLocaleString()}`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value as number), "Revenue"]}
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24}>
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
