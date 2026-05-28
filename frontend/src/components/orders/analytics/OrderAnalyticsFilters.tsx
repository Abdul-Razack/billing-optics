"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, FilterX } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface OrderAnalyticsFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onExport: () => void;
}

export function OrderAnalyticsFilters({
  dateRange,
  setDateRange,
  statusFilter,
  setStatusFilter,
  onExport
}: OrderAnalyticsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between bg-white p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[260px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Filter by date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "ALL")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
          </SelectContent>
        </Select>

        {(dateRange || statusFilter !== "ALL") && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setDateRange(undefined);
              setStatusFilter("ALL");
            }}
            title="Clear filters"
          >
            <FilterX className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      <Button variant="outline" onClick={onExport} className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" />
        Export Report
      </Button>
    </div>
  );
}
