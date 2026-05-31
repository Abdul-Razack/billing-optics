"use client";

import { useEffect, useState } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { DollarSign, TrendingUp, Receipt, Loader2 } from "lucide-react";
import { ReportService, SalesReportData, RevenueTrendData } from "@/services/report.service";
import { RevenueLineChart } from "../charts/RevenueLineChart";
import { TopProductsPieChart } from "../charts/TopProductsPieChart";

export function SalesTab() {
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [trendData, setTrendData] = useState<RevenueTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get first day of current month as default start date
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        const [sales, trend] = await Promise.all([
          ReportService.getSalesReport(startDate.toISOString(), new Date().toISOString()),
          ReportService.getRevenueTrend(startDate.toISOString(), new Date().toISOString(), "daily")
        ]);
        
        setSalesData(sales);
        setTrendData(trend);
      } catch (error) {
        console.error("Failed to fetch sales data", error);
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

  if (!salesData) {
    return <div className="p-4 text-center text-muted-foreground">Failed to load sales data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="Total Revenue" 
          value={`₹${salesData.kpis.revenue.toLocaleString()}`} 
          icon={DollarSign}
          description="Current Month"
        />
        <ReportCard 
          title="Total Sales Value" 
          value={`₹${salesData.kpis.totalSales.toLocaleString()}`} 
          icon={TrendingUp}
          description="Current Month"
        />
        <ReportCard 
          title="Average Order Value" 
          value={`₹${Math.round(salesData.kpis.averageInvoiceValue).toLocaleString()}`} 
          icon={Receipt}
          description="Current Month"
        />
        <ReportCard 
          title="Unpaid Invoices" 
          value={salesData.kpis.unpaidInvoices.toString()} 
          icon={DollarSign}
          description="Current Month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueLineChart data={trendData} />
        </div>
        <div>
          <TopProductsPieChart data={salesData.topProducts.map(p => ({ name: p.name, revenue: p.revenue }))} />
        </div>
      </div>
    </div>
  );
}
