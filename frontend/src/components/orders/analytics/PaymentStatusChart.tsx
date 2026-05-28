"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface PaymentStatusDataPoint {
  name: string;
  value: number;
  color: string;
}

export function PaymentStatusChart({ data }: { data: PaymentStatusDataPoint[] }) {
  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle>Payment Collection</CardTitle>
        <CardDescription>Invoices by payment status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
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
                        <span className="font-semibold" style={{ color: payload[0].payload.color }}>
                          {payload[0].name}: 
                        </span>
                        <span className="ml-2 font-medium">{payload[0].value}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
