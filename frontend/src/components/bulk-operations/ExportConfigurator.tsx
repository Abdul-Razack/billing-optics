"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DownloadCloud, FileText, LayoutList } from "lucide-react";

export function ExportConfigurator() {
  const [entity, setEntity] = useState("PRODUCTS");
  const [format, setFormat] = useState("CSV");

  const handleExport = () => {
    console.log(`Mock exporting ${entity} as ${format}`);
    // Simulate download
    alert(`Exporting ${entity} data to ${format}...`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <h3 className="font-medium text-lg mb-6 flex items-center">
            <LayoutList className="mr-2 h-5 w-5 text-primary" />
            1. Select Data Source
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${entity === "PRODUCTS" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
              onClick={() => setEntity("PRODUCTS")}
            >
              <div className="font-medium mb-1">Products Inventory</div>
              <p className="text-sm text-muted-foreground">Export all active products, including custom fields like Lens Material.</p>
            </div>
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${entity === "CUSTOMERS" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
              onClick={() => setEntity("CUSTOMERS")}
            >
              <div className="font-medium mb-1">Customer Directory</div>
              <p className="text-sm text-muted-foreground">Export customer contact info, purchase history summaries.</p>
            </div>
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${entity === "INVOICES" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
              onClick={() => setEntity("INVOICES")}
            >
              <div className="font-medium mb-1">Sales & Invoices</div>
              <p className="text-sm text-muted-foreground">Export billing records and payment statuses.</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <h3 className="font-medium text-lg mb-6 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            2. Configure Columns (Optional)
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">By default, all visible system fields and custom fields are exported. Uncheck columns you wish to exclude.</p>
          
          <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
            {["ID / SKU", "Name / Title", "Category", "Pricing Details", "Stock Levels", "All Custom Fields"].map((col) => (
              <div key={col} className="flex items-center space-x-2">
                <Checkbox id={`col-${col}`} defaultChecked />
                <label htmlFor={`col-${col}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {col}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border shadow-sm p-6 sticky top-6">
          <h3 className="font-medium text-lg mb-6">3. Export Format</h3>
          
          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <Label>File Format</Label>
              <Select value={format} onValueChange={(val) => setFormat(val || "CSV")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSV">Comma Separated Values (.csv)</SelectItem>
                  <SelectItem value="XLSX">Excel Workbook (.xlsx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button className="w-full" size="lg" onClick={handleExport}>
              <DownloadCloud className="mr-2 h-5 w-5" />
              Generate Export
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Large exports may take a few moments to prepare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
