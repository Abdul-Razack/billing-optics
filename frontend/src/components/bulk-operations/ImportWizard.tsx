"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "./FileUploadZone";
import { ColumnMapper } from "./ColumnMapper";
import { CustomField } from "@/types/custom-field";
import { MOCK_CUSTOM_FIELDS } from "@/lib/mock-custom-field-data";
import { Check, ChevronRight, UploadCloud, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock system fields for Products
const productSystemFields = [
  { key: "sku", name: "SKU / Barcode", isRequired: true },
  { key: "name", name: "Product Name", isRequired: true },
  { key: "category", name: "Category", isRequired: true },
  { key: "brand", name: "Brand", isRequired: false },
  { key: "price", name: "Selling Price", isRequired: true },
  { key: "stock", name: "Current Stock", isRequired: true },
];

export function ImportWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<string | undefined>(undefined);
  const [mappedColumns, setMappedColumns] = useState<Record<string, string>>({});

  // Mock source columns from an uploaded Excel file
  const mockSourceColumns = ["Item Code", "Product Title", "Category Name", "Retail Price", "Qty", "Lens Material", "Color"];

  const productCustomFields = MOCK_CUSTOM_FIELDS.filter(f => f.entityTarget === "PRODUCT");

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleMappingChange = (sourceCol: string, targetKey: string) => {
    setMappedColumns(prev => ({ ...prev, [sourceCol]: targetKey }));
  };

  const handleImport = () => {
    console.log("Mock import started with mapping:", mappedColumns);
    router.push("/products"); // Redirect to products after mock import
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
      <div className="bg-muted/30 border-b border-border px-8 py-6">
        <div className="flex items-center justify-between relative">
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0 hidden md:block"></div>
          
          {[
            { num: 1, title: "Upload File" },
            { num: 2, title: "Map Columns" },
            { num: 3, title: "Preview & Import" }
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center bg-muted/30 md:bg-transparent px-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step === s.num ? "bg-primary text-primary-foreground border-2 border-primary" :
                step > s.num ? "bg-green-500 text-white border-2 border-green-500" :
                "bg-card text-muted-foreground border-2 border-border"
              }`}>
                {step > s.num ? <Check className="h-5 w-5" /> : s.num}
              </div>
              <span className={`mt-2 text-sm font-medium hidden sm:block ${step === s.num ? "text-foreground" : "text-muted-foreground"}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Upload Data File</h2>
              <p className="text-muted-foreground">Upload your CSV or Excel file containing product data.</p>
            </div>
            
            <FileUploadZone 
              onFileSelect={() => setFile("product_catalog_2023.xlsx")}
              selectedFileName={file}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <strong>Tip:</strong> Ensure your file has a header row. If you are importing custom fields, make sure they are defined in the Custom Fields section first.
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Map Columns</h2>
              <p className="text-muted-foreground">Match the columns from your uploaded file to the system fields.</p>
            </div>

            <ColumnMapper 
              sourceColumns={mockSourceColumns}
              systemFields={productSystemFields}
              customFields={productCustomFields}
              mappedColumns={mappedColumns}
              onMappingChange={handleMappingChange}
            />
          </div>
        )}

        {step === 3 && (
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Ready to Import</h2>
              <p className="text-muted-foreground">Review your configuration before proceeding.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted/30 p-6 rounded-lg border border-border">
                <FileSpreadsheet className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">File</h3>
                <p className="text-sm text-muted-foreground">{file}</p>
                <p className="text-xs text-muted-foreground mt-1">~1,245 rows</p>
              </div>
              <div className="bg-muted/30 p-6 rounded-lg border border-border">
                <UploadCloud className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Target</h3>
                <p className="text-sm text-muted-foreground">Products Database</p>
              </div>
              <div className="bg-muted/30 p-6 rounded-lg border border-border">
                <Check className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Mapping</h3>
                <p className="text-sm text-muted-foreground">{Object.keys(mappedColumns).length} columns mapped</p>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800 text-sm max-w-xl mx-auto">
              Please do not close this window during the import process. It may take a few minutes depending on file size.
            </div>
          </div>
        )}
      </div>

      <div className="bg-muted/30 px-8 py-4 border-t border-border flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          Back
        </Button>
        {step < 3 ? (
          <Button onClick={handleNext} disabled={step === 1 && !file}>
            Next Step
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleImport}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Start Import
          </Button>
        )}
      </div>
    </div>
  );
}
