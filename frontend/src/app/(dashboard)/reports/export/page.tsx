"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ReportExportSelector, ReportType } from "@/components/reports/export/ReportExportSelector";
import { ExportConfigPanel } from "@/components/reports/export/ExportConfigPanel";
import { ExportHistoryTable, ExportRecord } from "@/components/reports/export/ExportHistoryTable";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { format } from "date-fns";


export default function UnifiedExportCenterPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("sales");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formatSelection, setFormatSelection] = useState<string>("csv");
  const [isLoading, setIsLoading] = useState(false);
  
  // Lazy initializer reads localStorage once on mount — no extra render needed
  const [history, setHistory] = useState<ExportRecord[]>(() => {
    try {
      const saved = localStorage.getItem("billing_optics_export_history");
      return saved ? (JSON.parse(saved) as ExportRecord[]) : [];
    } catch {
      return [];
    }
  });



  const saveHistory = (newHistory: ExportRecord[]) => {
    setHistory(newHistory);
    localStorage.setItem("billing_optics_export_history", JSON.stringify(newHistory));
  };

  const generateReportName = (type: string) => {
    switch(type) {
      case "sales": return "Sales Analysis Report";
      case "inventory": return "Inventory & Stock Report";
      case "customers": return "Customer Insights Report";
      case "financial": return "Financial Ledger Report";
      default: return "Custom Report";
    }
  };

  const getFormatDateRange = () => {
    if (!dateRange?.from) return "All Time";
    if (!dateRange.to) return format(dateRange.from, "MMM d, yyyy");
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  const handleDownloadNow = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRecord: ExportRecord = {
      id: crypto.randomUUID(),
      type: generateReportName(selectedReport),
      format: formatSelection,
      dateRange: getFormatDateRange(),
      createdAt: new Date().toISOString(),
      status: "completed",
      size: formatSelection === "csv" ? "14.2 KB" : "1.4 MB"
    };
    
    saveHistory([newRecord, ...history]);
    setIsLoading(false);
    toast.success(`Successfully generated ${formatSelection.toUpperCase()} report.`);
    
    // In a real app, we would trigger file download here
    console.log("Mock triggering download of file...");
  };

  const handleQueueExport = async () => {
    const newRecord: ExportRecord = {
      id: crypto.randomUUID(),
      type: generateReportName(selectedReport),
      format: formatSelection,
      dateRange: getFormatDateRange(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    
    saveHistory([newRecord, ...history]);
    toast.success("Report added to background queue.");

    // Simulate async background processing
    setTimeout(() => {
      setHistory(current => {
        const updated = current.map(r => r.id === newRecord.id ? { ...r, status: "processing" as const } : r);
        localStorage.setItem("billing_optics_export_history", JSON.stringify(updated));
        return updated;
      });

      setTimeout(() => {
        setHistory(current => {
          const finished = current.map(r => r.id === newRecord.id ? { 
            ...r, 
            status: "completed" as const,
            size: formatSelection === "csv" ? "42.1 KB" : "3.2 MB" 
          } : r);
          localStorage.setItem("billing_optics_export_history", JSON.stringify(finished));
          return finished;
        });
        toast.info(`Your queued ${formatSelection.toUpperCase()} report is ready to download.`);
      }, 4000);
      
    }, 2000);
  };

  const handlePrint = () => {
    toast.info("Preparing print preview...");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDeleteHistory = (id: string) => {
    saveHistory(history.filter(r => r.id !== id));
    toast.success("Report removed from history.");
  };

  const handleReDownload = (id: string) => {
    const record = history.find(r => r.id === id);
    if (record) {
      toast.success(`Downloading ${record.type} (${record.format.toUpperCase()})...`);
    }
  };

  return (
    <PageContainer title="Report Export Center" description="Generate, queue, and download analytics reports.">
      <ProductHeader title="Export Center" />
      
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
        
        {/* Left Column: Configuration */}
        <div className="xl:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">1. Select Report Type</h3>
            <ReportExportSelector 
              selected={selectedReport} 
              onSelect={setSelectedReport} 
            />
          </div>

          <div className="pt-4 border-t print:hidden">
            <h3 className="text-lg font-medium mb-3">Recent Exports</h3>
            <ExportHistoryTable 
              history={history} 
              onDownload={handleReDownload} 
              onDelete={handleDeleteHistory} 
            />
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="xl:col-span-1 print:hidden">
          <h3 className="text-lg font-medium mb-3">2. Configure & Generate</h3>
          <ExportConfigPanel 
            dateRange={dateRange}
            setDateRange={setDateRange}
            formatSelection={formatSelection}
            setFormatSelection={setFormatSelection}
            onDownloadNow={handleDownloadNow}
            onQueueExport={handleQueueExport}
            onPrint={handlePrint}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageContainer>
  );
}
