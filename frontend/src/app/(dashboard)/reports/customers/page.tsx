"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ReportService, CustomerReportData } from "@/services/report.service";
import { ExportService } from "@/services/export.service";
import { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startOfDay, endOfDay } from "date-fns";

import { CustomerOverviewCards } from "@/components/reports/customers/CustomerOverviewCards";
import dynamic from "next/dynamic";
const CustomerGrowthChart = dynamic(() => import("@/components/reports/customers/CustomerGrowthChart").then(mod => mod.CustomerGrowthChart), { ssr: false });
const CustomerSegmentsChart = dynamic(() => import("@/components/reports/customers/CustomerSegmentsChart").then(mod => mod.CustomerSegmentsChart), { ssr: false });
import { TopCustomersAnalytics } from "@/components/reports/customers/TopCustomersAnalytics";
import { CustomerFilters } from "@/components/reports/customers/CustomerFilters";

export default function CustomerInsightsPage() {
  const [reportData, setReportData] = useState<CustomerReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [customerType, setCustomerType] = useState<string>("all");
  const [frequency, setFrequency] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const start = dateRange?.from ? dateRange.from.toISOString() : undefined;
        const end = dateRange?.to ? dateRange.to.toISOString() : undefined;
        
        const data = await ReportService.getCustomerReport(customerType, frequency, start, end);
        setReportData(data);
      } catch (error) {
        console.error("Failed to load customer data", error);
        toast.error("Failed to load backend customer insights");
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [dateRange, customerType, frequency]);

  const handleExportCsv = async () => {
    try {
      const start = dateRange?.from ? dateRange.from.toISOString() : undefined;
      const end = dateRange?.to ? dateRange.to.toISOString() : undefined;
      toast.info("Preparing export...");
      await ExportService.exportCustomersCsv(start, end, customerType);
      toast.success("Export downloaded successfully");
    } catch (e) {
      toast.error("Failed to export customers");
    }
  };
  const handleExportPdf = () => toast.info("Exporting PDF...");
  const handlePrint = () => window.print();

  return (
    <PageContainer title="Customer Insights" description="Analyze customer behavior, retention, and growth.">
      <ProductHeader title="Customer Dashboard" />
      
      <div className="mt-6 space-y-6 print:m-0 print:space-y-4">
        <div className="print:hidden">
          <CustomerFilters 
            dateRange={dateRange}
            setDateRange={setDateRange}
            customerType={customerType}
            setCustomerType={setCustomerType}
            frequency={frequency}
            setFrequency={setFrequency}
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
            <CustomerOverviewCards data={reportData.kpis} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CustomerGrowthChart data={reportData.growthTrendData} />
              </div>
              <div className="lg:col-span-1">
                <CustomerSegmentsChart data={reportData.segmentationData} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TopCustomersAnalytics customers={reportData.topCustomersData as any} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">No customer data available</div>
        )}
      </div>
    </PageContainer>
  );
}
