"use client";

import { useEffect, useState } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { Users, TrendingUp, Loader2 } from "lucide-react";
import { ReportService, CustomerReportData } from "@/services/report.service";
import { CustomerGrowthChart } from "../charts/CustomerGrowthChart";

export function CustomersTab() {
  const [data, setData] = useState<CustomerReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await ReportService.getCustomerReport();
        setData(res);
      } catch (error) {
        console.error("Failed to fetch customer data", error);
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
    return <div className="p-4 text-center text-muted-foreground">Failed to load customer data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard 
          title="Total Customers" 
          value={data.kpis.totalCustomers.toLocaleString()} 
          icon={Users}
        />
        <ReportCard 
          title="New Customers (30d)" 
          value={data.kpis.newCustomers.toLocaleString()} 
          icon={Users}
          trend={{ value: "Recently joined", positive: true }}
        />
        <ReportCard 
          title="Returning Customers" 
          value={data.kpis.returningCustomers.toLocaleString()} 
          icon={TrendingUp}
          description={`${Math.round(data.kpis.retentionRate)}% retention rate`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomerGrowthChart data={data.growthTrendData} />
        </div>
        
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-medium mb-4">Customer Segmentation</h3>
          <div className="space-y-4">
            {data.segmentationData.length > 0 ? (
              data.segmentationData.map((seg, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></span>
                      {seg.name}
                    </span>
                    <span className="text-muted-foreground">{seg.value}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ backgroundColor: seg.color, width: `${Math.max(5, (seg.value / data.kpis.totalCustomers) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">Not enough data for segmentation</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
