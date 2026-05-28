"use client";

import { useEffect, useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { ReportService, InventoryReportData } from "@/services/report.service";
import { ExportService } from "@/services/export.service";
import { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startOfDay, endOfDay, startOfWeek, startOfMonth } from "date-fns";

import { InventoryOverviewCards } from "@/components/reports/inventory/InventoryOverviewCards";
import dynamic from "next/dynamic";
import { LowStockTable, LowStockItem } from "@/components/reports/inventory/LowStockTable";
import { StockMovementReport, StockMovement } from "@/components/reports/inventory/StockMovementReport";
import { InventoryFilterBar } from "@/components/reports/inventory/InventoryFilterBar";

const StockHealthChart = dynamic(() => import("@/components/reports/inventory/StockHealthChart").then(m => m.StockHealthChart), { ssr: false });
const CategoryBreakdownChart = dynamic(() => import("@/components/reports/inventory/CategoryBreakdownChart").then(m => m.CategoryBreakdownChart), { ssr: false });

export default function InventoryReportPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryReportData | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockStatus, setStockStatus] = useState<string>("all");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await CategoryService.getCategories();
        setCategories(catData);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const start = dateRange?.from ? dateRange.from.toISOString() : undefined;
        const end = dateRange?.to ? dateRange.to.toISOString() : undefined;

        const data = await ReportService.getInventoryReport(selectedCategory, stockStatus, start, end);
        setInventoryData(data);

        // Fetch low stock items for the table
        const lowStockData = await ReportService.getLowStockReport();
        setLowStockItems(lowStockData as any);

      } catch (error) {
        console.error("Failed to load inventory data", error);
        toast.error("Failed to load backend inventory report");
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [dateRange, selectedCategory, stockStatus]);

  // Stock Health formatting for the pie chart
  const stockHealthData = useMemo(() => {
    if (!inventoryData) return [];
    
    const inStock = inventoryData.kpis.totalProducts - inventoryData.kpis.outOfStockItems - inventoryData.kpis.lowStockItems;
    return [
      { name: "In Stock", value: inStock > 0 ? inStock : 0, color: "#10b981" },
      { name: "Low Stock", value: inventoryData.kpis.lowStockItems, color: "#f59e0b" },
      { name: "Out of Stock", value: inventoryData.kpis.outOfStockItems, color: "#ef4444" },
    ];
  }, [inventoryData]);

  // Movements formatting
  const stockMovements = useMemo<StockMovement[]>(() => {
    if (!inventoryData) return [];
    return [
      {
        id: 1,
        type: "IN",
        quantity: inventoryData.movements.stockIn,
        productName: "All Products (Inward)",
        reference: "-",
        date: new Date().toISOString(),
      },
      {
        id: 2,
        type: "OUT",
        quantity: inventoryData.movements.stockOut,
        productName: "All Products (Outward)",
        reference: "-",
        date: new Date().toISOString(),
      },
      {
        id: 3,
        type: "ADJUSTMENT",
        quantity: inventoryData.movements.adjustments,
        productName: "All Products (Adjustments)",
        reference: "-",
        date: new Date().toISOString(),
      }
    ];
  }, [inventoryData]);

  const handleExportCsv = async () => {
    try {
      toast.info("Preparing export...");
      await ExportService.exportInventoryCsv(selectedCategory);
      toast.success("Export downloaded successfully");
    } catch (e) {
      toast.error("Failed to export inventory");
    }
  };
  const handleExportPdf = () => toast.info("Exporting PDF...");
  const handlePrint = () => window.print();

  return (
    <PageContainer title="Inventory Report" description="Advanced insights into stock health and value.">
      <ProductHeader title="Inventory Dashboard" />
      
      <div className="mt-6 space-y-6 print:m-0 print:space-y-4">
        <div className="print:hidden">
          <InventoryFilterBar 
            categories={categories}
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            stockStatus={stockStatus}
            setStockStatus={setStockStatus}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
          />
        </div>

        {isLoading && !inventoryData ? (
          <div className="flex justify-center items-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : inventoryData ? (
          <div className="flex flex-col gap-6 font-sans pb-10">
            <InventoryOverviewCards data={inventoryData.kpis} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StockHealthChart data={stockHealthData} />
              <CategoryBreakdownChart data={inventoryData.categoryBreakdown.slice(0, 8)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LowStockTable items={lowStockItems} />
              <StockMovementReport movements={stockMovements} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">No inventory data available</div>
        )}
      </div>
    </PageContainer>
  );
}
