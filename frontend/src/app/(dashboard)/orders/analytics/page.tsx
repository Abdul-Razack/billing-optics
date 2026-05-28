"use client";

import { useEffect, useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { OrderService } from "@/services/order.service";
import { ApiInvoice } from "@/types/order";
import { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";

import { OrdersAnalyticsCards } from "@/components/orders/analytics/OrdersAnalyticsCards";
import dynamic from "next/dynamic";
import type { RevenueDataPoint } from "@/components/orders/analytics/RevenueChart";
import type { PaymentStatusDataPoint } from "@/components/orders/analytics/PaymentStatusChart";

const RevenueChart = dynamic(() => import("@/components/orders/analytics/RevenueChart").then(m => m.RevenueChart), { ssr: false });
const PaymentStatusChart = dynamic(() => import("@/components/orders/analytics/PaymentStatusChart").then(m => m.PaymentStatusChart), { ssr: false });
import { TopCustomersTable, TopCustomer } from "@/components/orders/analytics/TopCustomersTable";
import { OrderAnalyticsFilters } from "@/components/orders/analytics/OrderAnalyticsFilters";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";

export default function OrderAnalyticsPage() {
  const [orders, setOrders] = useState<ApiInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        // Fetch up to 1000 orders to aggregate for analytics
        const response = await OrderService.getOrders({ limit: 1000 });
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to load analytics data", error);
        toast.error("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Date filter
      if (dateRange?.from) {
        const orderDate = new Date(order.createdAt);
        if (isBefore(orderDate, startOfDay(dateRange.from))) return false;
        if (dateRange.to && isAfter(orderDate, endOfDay(dateRange.to))) return false;
      }
      
      // Status filter
      if (statusFilter !== "ALL" && order.paymentStatus !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [orders, dateRange, statusFilter]);

  // Aggregate Data for Cards
  const kpiData = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      acc.totalOrders += 1;
      acc.totalRevenue += order.grandTotal;
      if (order.paymentStatus === "PAID") acc.paidInvoices += 1;
      if (order.paymentStatus === "UNPAID" || order.paymentStatus === "PARTIAL") acc.pendingInvoices += 1;
      
      // Calculate overdue
      if (order.dueDate && new Date(order.dueDate) < new Date() && order.paymentStatus !== "PAID") {
        acc.overdueInvoices += 1;
      }
      return acc;
    }, {
      totalOrders: 0,
      totalRevenue: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0
    });
  }, [filteredOrders]);

  // Aggregate Data for Revenue Chart
  const revenueData = useMemo<RevenueDataPoint[]>(() => {
    const map = new Map<string, number>();
    
    // Sort by date first
    const sorted = [...filteredOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    sorted.forEach(order => {
      const d = format(new Date(order.createdAt), "MMM dd, yyyy");
      map.set(d, (map.get(d) || 0) + order.grandTotal);
    });

    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  }, [filteredOrders]);

  // Aggregate Data for Payment Status Chart
  const paymentStatusData = useMemo<PaymentStatusDataPoint[]>(() => {
    const counts = { PAID: 0, PARTIAL: 0, UNPAID: 0 };
    filteredOrders.forEach(o => counts[o.paymentStatus]++);
    
    return [
      { name: "Paid", value: counts.PAID, color: "#10b981" },
      { name: "Partial", value: counts.PARTIAL, color: "#f59e0b" },
      { name: "Unpaid", value: counts.UNPAID, color: "#ef4444" },
    ].filter(d => d.value > 0);
  }, [filteredOrders]);

  // Aggregate Data for Top Customers
  const topCustomers = useMemo<TopCustomer[]>(() => {
    const map = new Map<number, TopCustomer>();
    
    filteredOrders.forEach(order => {
      if (!order.customerId) return;
      
      if (!map.has(order.customerId)) {
        map.set(order.customerId, {
          id: order.customerId,
          name: order.customerName || `Customer #${order.customerId}`,
          orderCount: 0,
          totalSpent: 0
        });
      }
      
      const c = map.get(order.customerId)!;
      c.orderCount += 1;
      c.totalSpent += order.grandTotal;
    });
    
    return Array.from(map.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5); // Top 5
  }, [filteredOrders]);

  const handleExport = () => {
    toast.info("Exporting analytics report... (Mock)");
    // In a real scenario, this would trigger an API call or use jspdf/exceljs
  };

  return (
    <PageContainer title="Analytics Dashboard" description="Key metrics and insights for your orders and revenue.">
      <ProductHeader title="Order Analytics" />
      
      <div className="mt-6 space-y-6">
        <OrderAnalyticsFilters 
          dateRange={dateRange}
          setDateRange={setDateRange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onExport={handleExport}
        />

        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 font-sans pb-10">
            <OrdersAnalyticsCards data={kpiData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RevenueChart data={revenueData} />
              <PaymentStatusChart data={paymentStatusData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TopCustomersTable customers={topCustomers} />
              
              <div className="col-span-1 bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Analytics Summary</h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    <strong className="text-gray-900">Conversion Note:</strong> Filtered data represents {filteredOrders.length} out of {orders.length} total orders.
                  </p>
                  <p>
                    <strong className="text-gray-900">Highest Revenue Day:</strong>{" "}
                    {revenueData.length > 0 ? revenueData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current).date : "N/A"}
                  </p>
                  <p>
                    <strong className="text-gray-900">Overdue Risk:</strong>{" "}
                    {kpiData.totalOrders > 0 ? ((kpiData.overdueInvoices / kpiData.totalOrders) * 100).toFixed(1) : 0}% of filtered invoices are overdue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
