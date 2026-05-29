import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface OrderToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusChange: (value: string) => void;
  deliveryStatusFilter: string;
  onDeliveryStatusChange: (value: string) => void;
  onClearFilters: () => void;
}

export function OrderToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentStatusFilter,
  onPaymentStatusChange,
  deliveryStatusFilter,
  onDeliveryStatusChange,
  onClearFilters,
}: OrderToolbarProps) {
  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (paymentStatusFilter !== "all" ? 1 : 0) + (deliveryStatusFilter !== "all" ? 1 : 0);

  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center w-full">
      <div className="relative w-full sm:w-72 lg:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Order ID or Customer..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 border-dashed">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm leading-none">Payment Status</h4>
                <Select value={paymentStatusFilter} onValueChange={(v) => { if (v) onPaymentStatusChange(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid (Pending)</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm leading-none">Delivery Status</h4>
                <Select value={deliveryStatusFilter} onValueChange={(v) => { if (v) onDeliveryStatusChange(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Deliveries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Deliveries</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="READY">Ready for Pickup</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm leading-none">Order Status</h4>
                <Select value={statusFilter} onValueChange={(v) => { if (v) onStatusChange(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFilterCount > 0 && (
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
