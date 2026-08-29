"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CategoryTableAnalyticsProps {
  categories: {
    id: number;
    name: string;
    isActive: boolean;
    productCount: number;
    stock: number;
    inventoryValue: number;
    revenue: number;
    unitsSold: number;
  }[];
  totalRevenue: number;
}

export function CategoryTableAnalytics({ categories, totalRevenue }: CategoryTableAnalyticsProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Category Performance Details</h3>
          <p className="text-sm text-muted-foreground">Comprehensive metrics for all categories</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold text-foreground py-4">Category Name</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Products</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Stock Qty</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Units Sold</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Inventory Value</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Revenue</TableHead>
              <TableHead className="font-semibold text-foreground text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => {
                const percentage = totalRevenue > 0 
                  ? ((category.revenue / totalRevenue) * 100).toFixed(1) 
                  : "0.0";
                  
                return (
                  <TableRow key={category.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"} className="font-normal">
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{category.productCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{category.stock.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{category.unitsSold.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(category.inventoryValue)}</TableCell>
                    <TableCell className="text-right font-medium text-primary">{formatCurrency(category.revenue)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{percentage}%</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
