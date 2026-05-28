"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface StockHealthData {
  name: string;
  value: number;
  color: string;
}

export function StockHealthChart({ data }: { data: StockHealthData[] }) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Stock Health</CardTitle>
        <CardDescription>Distribution of inventory by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No stock data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border p-2 rounded shadow-sm text-sm">
                          <p className="font-semibold" style={{ color: payload[0].payload.color }}>
                            {payload[0].name}
                          </p>
                          <p>{payload[0].value} products</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
