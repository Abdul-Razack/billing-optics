"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ReportService, CategoryReportData } from "@/services/report.service";
import { ExportService } from "@/services/export.service";
import { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startOfMonth, endOfMonth } from "date-fns";

import { CategoryOverviewCards } from "@/components/reports/categories/CategoryOverviewCards";
import { CategoryRevenueChart } from "@/components/reports/categories/CategoryRevenueChart";
import { CategoryTableAnalytics } from "@/components/reports/categories/CategoryTableAnalytics";
import { InventoryFilterBar } from "@/components/reports/inventory/InventoryFilterBar"; // Reusing for date range

export default function CategoryReportPage() {
  const [reportData, setReportData] = useState<CategoryReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const start = dateRange?.from ? dateRange.from.toISOString() : undefined;
        const end = dateRange?.to ? dateRange.to.toISOString() : undefined;

        const data = await ReportService.getCategoryReport(start, end);
        setReportData(data);
      } catch (error) {
        console.error("Failed to load category analytics", error);
        toast.error("Failed to load category insights report");
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [dateRange]);

  const handleExportCsv = async () => {
    toast.info("Exporting functionality coming soon");
    // TODO: Implement export
  };
  const handleExportPdf = () => toast.info("Exporting PDF...");
  const handlePrint = () => window.print();

  return (
    <PageContainer title="Category Insights" description="Deep dive into product category performance.">
      <ProductHeader title="Category Analytics Dashboard" />
      
      <div className="mt-6 space-y-6 print:m-0 print:space-y-4">
        <div className="print:hidden">
          {/* We use a modified filter bar. We only need the Date Range part, but to keep it simple, we can reuse InventoryFilterBar or build a simpler one */}
          <InventoryFilterBar 
            categories={[]}
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedCategory="all"
            setSelectedCategory={() => {}}
            stockStatus="all"
            setStockStatus={() => {}}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
          />
        </div>

        {isLoading && !reportData ? (
          <div className="flex justify-center items-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reportData ? (
          <div className="flex flex-col gap-6 font-sans pb-10">
            <CategoryOverviewCards data={reportData.kpis} />
            
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <CategoryRevenueChart data={reportData.categoryBreakdown} />
            </div>

            <CategoryTableAnalytics 
              categories={reportData.categoryBreakdown} 
              totalRevenue={reportData.kpis.totalRevenue} 
            />
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">No category data available</div>
        )}
      </div>
    </PageContainer>
  );
}
