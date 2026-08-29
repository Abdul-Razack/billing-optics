"use client";

import { useEffect, useState } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { Grid, DollarSign, Package, Loader2 } from "lucide-react";
import { ReportService, CategoryReportData } from "@/services/report.service";
import { CategoryRevenueChart } from "../categories/CategoryRevenueChart";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CategoriesTab() {
  const [data, setData] = useState<CategoryReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Default to a 30-day view for the quick overview tab
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        
        const res = await ReportService.getCategoryReport(start.toISOString(), end.toISOString());
        setData(res);
      } catch (error) {
        console.error("Failed to fetch category data", error);
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
    return <div className="p-4 text-center text-muted-foreground">Failed to load category data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Category Performance (Last 30 Days)</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href="/reports/categories">
            View Full Report <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard 
          title="Total Active Categories" 
          value={data.kpis.activeCategories.toString()} 
          icon={Grid}
          description={`Out of ${data.kpis.totalCategories} total`}
        />
        <ReportCard 
          title="Category Revenue" 
          value={formatCurrency(data.kpis.totalRevenue)} 
          icon={DollarSign}
        />
        <ReportCard 
          title="Top Category" 
          value={data.kpis.topCategory} 
          icon={Package}
          description={formatCurrency(data.kpis.topCategoryRevenue)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-1">
          <CategoryRevenueChart data={data.categoryBreakdown} />
        </div>
      </div>
    </div>
  );
}
