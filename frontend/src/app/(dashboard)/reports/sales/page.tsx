"use client";

import { useEffect, useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ReportService, SalesReportData, RevenueTrendData } from "@/services/report.service";
import { ExportService } from "@/services/export.service";
import { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";
import { startOfDay, endOfDay, startOfWeek, startOfMonth } from "date-fns";

import { SalesOverviewCards } from "@/components/reports/sales/SalesOverviewCards";
import dynamic from "next/dynamic";
const SalesTrendChart = dynamic(() => import("@/components/reports/sales/SalesTrendChart").then(m => m.SalesTrendChart), { ssr: false });
import { TopProductsReport } from "@/components/reports/sales/TopProductsReport";
import { TopCustomersReport } from "@/components/reports/sales/TopCustomersReport";
import { SalesReportToolbar } from "@/components/reports/sales/SalesReportToolbar";
import { toast } from "sonner";

export default function SalesReportPage() {
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [trendData, setTrendData] = useState<RevenueTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [presetRange, setPresetRange] = useState<string>("this_month");
  const [groupBy, setGroupBy] = useState<"daily" | "weekly" | "monthly">("daily");

  // Derive dateRange from preset — no useState+useEffect needed
  const dateRange = useMemo(() => {
    const today = new Date();
    if (presetRange === "today") return { from: startOfDay(today), to: endOfDay(today) };
    if (presetRange === "this_week") return { from: startOfWeek(today), to: endOfDay(today) };
    if (presetRange === "this_month") return { from: startOfMonth(today), to: endOfDay(today) };
    return undefined;
  }, [presetRange]);

  // Allow manual date range override when preset is "custom"
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const effectiveDateRange = presetRange === "custom" ? customDateRange : dateRange;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const start = effectiveDateRange?.from ? effectiveDateRange.from.toISOString() : undefined;
        const end = effectiveDateRange?.to ? effectiveDateRange.to.toISOString() : undefined;

        // Fetch Real Backend Sales Report
        const fetchedSalesData = await ReportService.getSalesReport(start, end);
        setSalesData(fetchedSalesData);

        // Fetch Real Backend Revenue Trend
        const fetchedTrendData = await ReportService.getRevenueTrend(start, end, groupBy);
        setTrendData(fetchedTrendData);
      } catch (error) {
        console.error("Failed to load report data", error);
        toast.error("Failed to load backend report data");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Slight debounce for fetching backend report when date changes
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [effectiveDateRange, groupBy]);

  const handleExportCsv = async () => {
    try {
      const start = effectiveDateRange?.from ? effectiveDateRange.from.toISOString() : undefined;
      const end = effectiveDateRange?.to ? effectiveDateRange.to.toISOString() : undefined;
      toast.info("Preparing export...");
      await ExportService.exportSalesCsv(start, end, "all");
      toast.success("Export downloaded successfully");
    } catch (e) {
      toast.error("Failed to export sales");
    }
  };
  const handleExportPdf = () => toast.info("Exporting PDF...");
  const handlePrint = () => window.print();

  return (
    <PageContainer title="Sales Report" description="Centralized sales and revenue reporting.">
      <ProductHeader title="Sales Dashboard" />
      
      <div className="mt-6 space-y-6 print:m-0 print:space-y-4">
        <div className="print:hidden">
          <SalesReportToolbar 
            dateRange={effectiveDateRange}
            setDateRange={setCustomDateRange}
            presetRange={presetRange}
            setPresetRange={setPresetRange}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
          />
        </div>

        {isLoading && !salesData ? (
          <div className="flex justify-center items-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : salesData ? (
          <div className="flex flex-col gap-6 font-sans pb-10">
            {/* SalesOverviewCards needs the kpi format */}
            <SalesOverviewCards data={{
              totalSales: salesData.kpis.totalSales,
              revenue: salesData.kpis.revenue,
              totalInvoices: salesData.kpis.totalInvoices,
              ordersCompleted: salesData.kpis.paidInvoices,
              unpaidInvoices: salesData.kpis.unpaidInvoices,
              partialInvoices: salesData.kpis.partialInvoices,
              averageOrderValue: salesData.kpis.averageInvoiceValue,
            }} />
            
            <SalesTrendChart data={trendData} groupBy={groupBy} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopProductsReport products={salesData.topProducts.map(p => ({
                id: p.id.toString(), // Fix component expecting string ID potentially
                name: p.name,
                sku: p.sku,
                unitsSold: p.unitsSold,
                revenue: p.revenue
              })) as any} />
              <TopCustomersReport customers={salesData.topCustomers.map(c => ({
                id: c.id,
                name: c.name,
                orderCount: c.orderCount,
                revenue: c.revenue
              }))} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">No sales data available</div>
        )}
      </div>
    </PageContainer>
  );
}
