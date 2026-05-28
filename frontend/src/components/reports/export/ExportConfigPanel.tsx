import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, Printer, LayoutList } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExportConfigPanelProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  formatSelection: string;
  setFormatSelection: (format: string) => void;
  onDownloadNow: () => void;
  onQueueExport: () => void;
  onPrint: () => void;
  isLoading: boolean;
}

export function ExportConfigPanel({
  dateRange,
  setDateRange,
  formatSelection,
  setFormatSelection,
  onDownloadNow,
  onQueueExport,
  onPrint,
  isLoading
}: ExportConfigPanelProps) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">Reporting Period</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
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
                  <span>Select date range</span>
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
          <p className="text-xs text-muted-foreground mt-2">
            Leave blank to export all-time records.
          </p>
        </div>

        <div className="pt-4 border-t">
          <Label className="text-base font-semibold mb-3 block">Export Format</Label>
          <RadioGroup 
            value={formatSelection} 
            onValueChange={setFormatSelection}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md border border-transparent hover:border-gray-200 transition-colors cursor-pointer" onClick={() => setFormatSelection("csv")}>
              <RadioGroupItem value="csv" id="format-csv" />
              <Label htmlFor="format-csv" className="cursor-pointer font-medium">CSV Data Export</Label>
              <span className="text-xs text-muted-foreground ml-auto">For Excel/Sheets</span>
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md border border-transparent hover:border-gray-200 transition-colors cursor-pointer" onClick={() => setFormatSelection("pdf")}>
              <RadioGroupItem value="pdf" id="format-pdf" />
              <Label htmlFor="format-pdf" className="cursor-pointer font-medium">PDF Document</Label>
              <span className="text-xs text-muted-foreground ml-auto">Print ready</span>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="pt-6 border-t flex flex-col gap-3">
        <Button 
          className="w-full flex items-center justify-center gap-2" 
          onClick={onDownloadNow}
          disabled={isLoading}
        >
          <Download className="h-4 w-4" />
          Download Now
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2" 
            onClick={onPrint}
            disabled={isLoading || formatSelection !== "pdf"}
            title={formatSelection !== "pdf" ? "Print requires PDF format" : ""}
          >
            <Printer className="h-4 w-4" />
            Print Preview
          </Button>
          <Button 
            variant="secondary" 
            className="w-full flex items-center justify-center gap-2" 
            onClick={onQueueExport}
            disabled={isLoading}
          >
            <LayoutList className="h-4 w-4" />
            Queue Export
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Large reports are automatically queued for background processing.
        </p>
      </div>
    </div>
  );
}
