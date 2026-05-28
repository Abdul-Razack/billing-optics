"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, Printer, FileText } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CustomerFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  customerType: string;
  setCustomerType: (type: string) => void;
  frequency: string;
  setFrequency: (freq: string) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
}

export function CustomerFilters({
  dateRange,
  setDateRange,
  customerType,
  setCustomerType,
  frequency,
  setFrequency,
  onExportCsv,
  onExportPdf,
  onPrint,
}: CustomerFiltersProps) {
  
  return (
    <div className="flex flex-col md:flex-row gap-3 items-end md:items-center justify-between bg-white p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
        
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
                <span>Acquisition Date Range</span>
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

        <Select value={customerType} onValueChange={(val) => setCustomerType(val || "all")}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Customer Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="new">New Customers</SelectItem>
            <SelectItem value="returning">Returning</SelectItem>
          </SelectContent>
        </Select>

        <Select value={frequency} onValueChange={(val) => setFrequency(val || "all")}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Frequency</SelectItem>
            <SelectItem value="high">High (&gt;10 orders)</SelectItem>
            <SelectItem value="medium">Medium (3-10 orders)</SelectItem>
            <SelectItem value="low">Low (1-2 orders)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <Button variant="outline" onClick={onPrint} size="icon" title="Print Report">
          <Printer className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportCsv}>
              <FileText className="mr-2 h-4 w-4" /> Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf}>
              <FileText className="mr-2 h-4 w-4" /> Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
