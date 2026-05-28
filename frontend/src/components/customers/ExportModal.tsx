"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { ExportColumn, exportToCSV, exportToXLSX, exportToJSON } from "@/lib/export";
import { ApiCustomer } from "@/types/customer";

export type ExportScope = "all" | "selected" | "filtered";
export type ExportFormat = "csv" | "xlsx" | "json";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: ApiCustomer[]; // The full or filtered list
  selectedIds: string[]; // For "selected" scope
  totalCount: number; // For "all" scope info
}

const AVAILABLE_FIELDS = [
  { id: "fullName", label: "Full Name", key: "fullName" },
  { id: "phone", label: "Phone Number", key: "phone" },
  { id: "email", label: "Email Address", key: "email" },
  { id: "address", label: "Address", key: "address" },
  { id: "status", label: "Status", key: "isActive" },
  { id: "createdAt", label: "Created Date", key: "createdAt" },
  { id: "customFields", label: "Custom Fields", key: "customFields" }
];

export function ExportModal({ isOpen, onClose, customers, selectedIds, totalCount }: ExportModalProps) {
  const [scope, setScope] = useState<ExportScope>("filtered");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [selectedFields, setSelectedFields] = useState<string[]>(AVAILABLE_FIELDS.map(f => f.id));

  const handleSelectAllFields = () => setSelectedFields(AVAILABLE_FIELDS.map(f => f.id));
  const handleClearAllFields = () => setSelectedFields([]);

  const toggleField = (id: string) => {
    setSelectedFields(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleExport = () => {
    let dataToExport = customers;
    if (scope === "selected") {
      dataToExport = customers.filter(c => selectedIds.includes(String(c.id)));
    }
    // "all" scope relies on all fetched customers; if backend pagination is active, 
    // a true "export all" might require a backend endpoint. We will use the available data.
    
    const columns: ExportColumn[] = AVAILABLE_FIELDS
      .filter(f => selectedFields.includes(f.id))
      .map(f => ({ header: f.label, key: f.key }));

    // Pre-process some values before passing to export functions
    const formattedData = dataToExport.map(c => {
      const row: any = { ...c };
      if (selectedFields.includes("status")) {
        row.isActive = c.isActive ? "Active" : "Inactive";
      }
      if (selectedFields.includes("createdAt")) {
        row.createdAt = new Date(c.createdAt).toLocaleDateString();
      }
      if (selectedFields.includes("customFields")) {
        row.customFields = c.customFields ? JSON.stringify(c.customFields) : "";
      }
      return row;
    });

    const filename = `customers_export_${new Date().getTime()}`;

    if (format === "csv") exportToCSV(formattedData, columns, filename);
    if (format === "xlsx") exportToXLSX(formattedData, columns, filename);
    if (format === "json") exportToJSON(formattedData, columns, filename);

    onClose();
  };

  const hasSelected = selectedIds.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Customers
          </DialogTitle>
          <DialogDescription>
            Configure your export scope, format, and fields.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Export Scope</Label>
              <Select value={scope} onValueChange={(v: ExportScope | null) => v && setScope(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filtered">Filtered Results ({customers.length})</SelectItem>
                  <SelectItem value="selected" disabled={!hasSelected}>
                    Selected ({selectedIds.length})
                  </SelectItem>
                  <SelectItem value="all">All ({totalCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={(v: any) => v && setFormat(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fields to Export</Label>
              <div className="space-x-2 text-sm">
                <Button variant="link" className="h-auto p-0 text-muted-foreground" onClick={handleSelectAllFields}>Select all</Button>
                <span className="text-muted-foreground">|</span>
                <Button variant="link" className="h-auto p-0 text-muted-foreground" onClick={handleClearAllFields}>Clear all</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-muted/20">
              {AVAILABLE_FIELDS.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`field-${field.id}`} 
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <Label htmlFor={`field-${field.id}`} className="font-normal cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} disabled={selectedFields.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
