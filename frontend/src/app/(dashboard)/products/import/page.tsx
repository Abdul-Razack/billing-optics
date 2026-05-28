"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UploadStep } from "@/components/products/import/UploadStep";
import { MappingStep } from "@/components/products/import/MappingStep";
import { PreviewStep } from "@/components/products/import/PreviewStep";
import { ConfirmStep } from "@/components/products/import/ConfirmStep";

export type ImportWizardStep = "upload" | "map" | "preview" | "confirm";

export interface MappedData {
  sku: string;
  name: string;
  category: string;
  costPrice: string;
  sellingPrice: string;
  minStockAlert: string;
  [key: string]: any; // custom attributes
}

export default function ProductImportPage() {
  const [currentStep, setCurrentStep] = useState<ImportWizardStep>("upload");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validatedData, setValidatedData] = useState<MappedData[]>([]);

  const handleFileUpload = (file: File, headers: string[], data: any[]) => {
    setRawFile(file);
    setParsedHeaders(headers);
    setParsedData(data);
    setCurrentStep("map");
  };

  const handleMappingComplete = (newMapping: Record<string, string>, mappedData: MappedData[]) => {
    setMapping(newMapping);
    setValidatedData(mappedData);
    setCurrentStep("preview");
  };

  const handlePreviewConfirm = () => {
    setCurrentStep("confirm");
  };

  const handleReset = () => {
    setRawFile(null);
    setParsedHeaders([]);
    setParsedData([]);
    setMapping({});
    setValidatedData([]);
    setCurrentStep("upload");
  };

  const steps = [
    { id: "upload", name: "1. Upload File" },
    { id: "map", name: "2. Map Columns" },
    { id: "preview", name: "3. Preview Data" },
    { id: "confirm", name: "4. Import" }
  ];

  return (
    <PageContainer title="Import Products" description="Bulk upload products via CSV or XLSX.">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <ProductHeader title="Bulk Import Products" />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between border-b pb-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isPast = steps.findIndex(s => s.id === currentStep) > index;
            
            return (
              <div key={step.id} className="flex flex-col items-center w-1/4">
                <div className={`text-sm font-medium ${isActive ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                  {step.name}
                </div>
                <div className={`h-1 w-full mt-2 rounded-full ${isActive ? 'bg-primary' : isPast ? 'bg-primary/50' : 'bg-secondary'}`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        {currentStep === "upload" && (
          <UploadStep onComplete={handleFileUpload} />
        )}
        {currentStep === "map" && (
          <MappingStep 
            headers={parsedHeaders} 
            rawData={parsedData} 
            onComplete={handleMappingComplete}
            onBack={() => setCurrentStep("upload")}
          />
        )}
        {currentStep === "preview" && (
          <PreviewStep 
            data={validatedData} 
            onConfirm={handlePreviewConfirm}
            onBack={() => setCurrentStep("map")}
          />
        )}
        {currentStep === "confirm" && (
          <ConfirmStep 
            data={validatedData}
            onComplete={handleReset}
          />
        )}
      </div>
    </PageContainer>
  );
}
