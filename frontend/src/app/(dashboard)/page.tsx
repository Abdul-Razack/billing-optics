"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { OrderTable } from "@/components/orders/OrderTable";
import { Users, FileText, Package, DollarSign, Loader2 } from "lucide-react";
import { ReportService, SalesReportData, CustomerReportData } from "@/services/report.service";
import { OrderService } from "@/services/order.service";
import { ApiInvoice } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";
import Link from "next/link";

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerReportData | null>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<ApiInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const start = startOfMonth(today).toISOString();
        const end = endOfMonth(today).toISOString();

        const [fetchedSales, fetchedCustomers, fetchedLowStock, fetchedOrders] = await Promise.all([
          ReportService.getSalesReport(start, end),
          ReportService.getCustomerReport("all", "all", start, end),
          ReportService.getLowStockReport(),
          OrderService.getOrders({ limit: 5, sortBy: "date", sortDirection: "desc" })
        ]);

        setSalesData(fetchedSales);
        setCustomerData(fetchedCustomers);
        setLowStock(fetchedLowStock);
        setRecentOrders(fetchedOrders.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <PageContainer title="Dashboard" description="Overview of your business metrics and recent activity.">
        <div className="flex justify-center items-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  // Calculate total products sold safely
  const totalProductsSold = salesData?.topProducts?.reduce((acc, p) => acc + (p.unitsSold || 0), 0) || 0;

  return (
    <PageContainer 
      title="Dashboard" 
      description="Overview of your business metrics and recent activity."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-4 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue (This Month)</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(salesData?.kpis.revenue || 0)}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-4 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Invoices (This Month)</p>
            <p className="text-2xl font-semibold text-foreground">{salesData?.kpis.totalInvoices || 0}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-4 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">New Customers</p>
            <p className="text-2xl font-semibold text-foreground">{customerData?.kpis.newCustomers || 0}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-4 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Products Sold (Top 5)</p>
            <p className="text-2xl font-semibold text-foreground">{totalProductsSold}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <SectionCard title="Recent Activity" description="Latest invoices and transactions.">
            {recentOrders.length > 0 ? (
              <OrderTable 
                orders={recentOrders} 
                sortBy="date" 
                sortDirection="desc" 
                onSort={() => {}} 
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">No recent orders found.</div>
            )}
          </SectionCard>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-1">
          <SectionCard title="Low Stock Alerts" description="Products that need restocking.">
            <div className="space-y-4">
              {lowStock.length > 0 ? (
                lowStock.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-md border border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-background rounded-md flex items-center justify-center border border-border">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Stock: {item.stock} left (Min: {item.minStockAlert})</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                      Low
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground border border-border rounded-md bg-muted/50">
                  All products are well stocked.
                </div>
              )}
            </div>
            {lowStock.length > 0 && (
               <div className="mt-4 pt-4 border-t border-border flex justify-end">
                 <Link href="/inventory/alerts" className="text-sm text-primary hover:underline">
                   View all alerts &rarr;
                 </Link>
               </div>
            )}
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
