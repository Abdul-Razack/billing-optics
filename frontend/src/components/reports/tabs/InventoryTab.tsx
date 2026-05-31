"use client";

import { useEffect, useState } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { Package, TrendingUp, Loader2 } from "lucide-react";
import { ReportService, InventoryReportData } from "@/services/report.service";

export function InventoryTab() {
  const [data, setData] = useState<InventoryReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const inv = await ReportService.getInventoryReport();
        setData(inv);
      } catch (error) {
        console.error("Failed to fetch inventory data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-4 text-center text-muted-foreground">Failed to load inventory data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard 
          title="Total Stock Value" 
          value={`₹${data.kpis.inventoryValue.toLocaleString()}`} 
          icon={Package}
        />
        <ReportCard 
          title="Total Products" 
          value={data.kpis.totalProducts.toLocaleString()} 
          icon={Package}
        />
        <ReportCard 
          title="Low/Out of Stock" 
          value={`${data.kpis.lowStockItems + data.kpis.outOfStockItems}`} 
          icon={TrendingUp}
          trend={{ value: "Needs attention", positive: false }}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Stock Breakdown by Category</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Units in Stock</th>
                <th className="px-4 py-3 font-medium text-right">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {data.categoryBreakdown.length > 0 ? (
                data.categoryBreakdown.map((cat, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">{cat.category}</td>
                    <td className="px-4 py-3 text-right">{cat.stock.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{cat.value.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No categories found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
