"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderSkeleton } from "@/components/orders/OrderSkeleton";
import { OrderToolbar } from "@/components/orders/OrderToolbar";
import { BulkOrderToolbar } from "@/components/orders/BulkOrderToolbar";
import { OrderService } from "@/services/order.service";
import { ApiInvoice } from "@/types/order";
import { StockPagination } from "@/components/inventory/StockPagination";

export default function OrdersListingPage() {
  const [orders, setOrders] = useState<ApiInvoice[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [error, setError] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");
  
  // Sorting
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const { data, total } = await OrderService.getOrders({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        deliveryStatus: deliveryStatusFilter,
        sortBy,
        sortDirection,
      });
      setOrders(data);
      setTotalItems(total);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [currentPage, pageSize, searchQuery, statusFilter, paymentStatusFilter, deliveryStatusFilter, sortBy, sortDirection]);

  // Bulk Actions
  const handleSelectToggle = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? orders.map(o => o.id) : []);
  };

  const handleClearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} orders?`)) return;
    setIsProcessingBulk(true);
    try {
      await OrderService.bulkDeleteOrders(selectedIds);
      setSelectedIds([]);
      await fetchOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    setIsProcessingBulk(true);
    try {
      await OrderService.bulkUpdateOrderStatus(selectedIds, status);
      setSelectedIds([]);
      await fetchOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleDeleteSingle = async (id: number) => {
    if (!confirm("Are you sure you want to cancel/delete this order?")) return;
    try {
      await OrderService.deleteOrder(id);
      await fetchOrders();
    } catch (e) {}
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <PageContainer title="Orders & Invoices" description="Manage sales orders, billing, and payment tracking.">
      <ProductHeader 
        title="All Orders" 
        action={{ label: "Create Order", href: "/orders/create" }} 
      />

      <div className="flex flex-col gap-4 mb-6 mt-6">
        <OrderToolbar 
          searchQuery={searchQuery}
          onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
          statusFilter={statusFilter}
          onStatusChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          paymentStatusFilter={paymentStatusFilter}
          onPaymentStatusChange={(v) => { setPaymentStatusFilter(v); setCurrentPage(1); }}
          deliveryStatusFilter={deliveryStatusFilter}
          onDeliveryStatusChange={(v) => { setDeliveryStatusFilter(v); setCurrentPage(1); }}
          onClearFilters={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setPaymentStatusFilter("all");
            setDeliveryStatusFilter("all");
            setCurrentPage(1);
          }}
        />

        <BulkOrderToolbar 
          selectedCount={selectedIds.length}
          onClearSelection={handleClearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          isProcessing={isProcessingBulk}
        />
      </div>

      {error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20 mb-4 flex flex-col items-center">
          <p>Failed to load orders. Please try again.</p>
          <button className="mt-2 text-sm underline" onClick={fetchOrders}>Retry</button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-sm">
          {isLoading ? (
            <OrderSkeleton />
          ) : (
            <>
              <OrderTable 
                orders={orders} 
                onDelete={handleDeleteSingle}
                onDeliveryStatusChange={async (id, status) => {
                  try {
                    await OrderService.updateDeliveryStatus(id, status);
                    await fetchOrders();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                selectedIds={selectedIds}
                onSelectToggle={handleSelectToggle}
                onSelectAll={handleSelectAll}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              {orders.length > 0 && (
                <StockPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                />
              )}
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
}
