"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export interface CategoryBreakdownData {
  category: string;
  stock: number;
}

export function CategoryBreakdownChart({ data }: { data: CategoryBreakdownData[] }) {
  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Stock quantity by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No category data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border p-2 rounded shadow-sm text-sm">
                          <p className="font-semibold">{label}</p>
                          <p className="text-blue-600">{payload[0].value} items in stock</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="stock" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
