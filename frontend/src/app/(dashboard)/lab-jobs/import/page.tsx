"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FileUploader } from "@/components/shared/import/FileUploader";
import { MappingTable, ImportFieldDef } from "@/components/shared/import/MappingTable";
import { ImportPreview } from "@/components/shared/import/ImportPreview";
import { ImportProgress } from "@/components/shared/import/ImportProgress";
import { ImportSummary, ImportResult } from "@/components/shared/import/ImportSummary";
import { exportToCSV } from "@/lib/export";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { fetchClient } from "@/lib/api-client";

type ImportWizardStep = "upload" | "map" | "preview" | "importing" | "summary";

const SYSTEM_FIELDS: ImportFieldDef[] = [
  { id: "jobTitle", label: "Job Title", isRequired: true },
  { id: "invoiceNumber", label: "Invoice Number", isRequired: true },
  { id: "vendorName", label: "Vendor Name" },
  { id: "status", label: "Status (PENDING/IN_PROGRESS/COMPLETED/DELIVERED/CANCELLED)" },
  { id: "expectedDate", label: "Expected Date" },
  { id: "sentDate", label: "Sent Date" },
  { id: "receivedDate", label: "Received Date" },
  { id: "notes", label: "Notes" }
];

export default function LabJobImportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ImportWizardStep>("upload");
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [mappedData, setMappedData] = useState<Record<string, any>[]>([]);
  
  const allFields = SYSTEM_FIELDS;
  
  // Import tracking
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult>({ successCount: 0, invalidCount: 0, failedRows: [] });

  const handleDownloadTemplate = () => {
    const columns = allFields.map(f => ({ header: f.label, key: f.id }));
    const sampleData = [
      allFields.reduce((acc, f) => ({ ...acc, [f.id]: f.isRequired ? "Sample Data" : "" }), {})
    ];
    exportToCSV(sampleData, columns, "lab_jobs_import_template");
  };

  const handleFileUpload = (file: File, headers: string[], data: any[]) => {
    setParsedHeaders(headers);
    setParsedData(data);
    setCurrentStep("map");
  };

  const handleMappingComplete = (mapping: Record<string, string>, data: Record<string, any>[]) => {
    setMappedData(data);
    setCurrentStep("preview");
  };

  const startImport = async () => {
    setCurrentStep("importing");
    
    // Separate valid/invalid based on required fields
    const validRows = mappedData.filter(row => {
      return allFields.filter(f => f.isRequired).every(f => !!row[f.id]);
    });
    const invalidCount = mappedData.length - validRows.length;

    try {
      // 1. Convert valid rows to CSV string matching backend expected headers
      const csvString = Papa.unparse(validRows);
      const blob = new Blob([csvString], { type: 'text/csv' });
      const file = new File([blob], 'lab_jobs_import.csv', { type: 'text/csv' });

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('file', file);

      // 3. Send to bulk endpoint
      const response = await fetchClient<{ success: boolean; data: { imported: number; skipped: number; errors: string[] } }>("/lab-jobs/bulk", {
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success) {
        setImportResult({
          successCount: response.data.imported,
          invalidCount: invalidCount + response.data.skipped,
          failedRows: response.data.errors.map((e: string, i: number) => ({ index: i + 1, reason: e }))
        });
      } else {
        setImportResult({
          successCount: 0,
          invalidCount: mappedData.length,
          failedRows: [{ index: 0, reason: "Server returned a failed response." }]
        });
      }
    } catch (err: any) {
      console.error("Bulk upload failed", err);
      setImportResult({
        successCount: 0,
        invalidCount: mappedData.length,
        failedRows: [{ index: 0, reason: err.message || "Network error during upload" }]
      });
    }

    setCurrentStep("summary");
  };

  const steps = [
    { id: "upload", name: "1. Upload File" },
    { id: "map", name: "2. Map Columns" },
    { id: "preview", name: "3. Preview Data" },
    { id: "importing", name: "4. Import" }
  ];

  return (
    <PageContainer title="Import Lab Jobs" description="Bulk upload lab jobs via CSV or XLSX.">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/lab-jobs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bulk Import Lab Jobs</h1>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between border-b pb-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep || (step.id === "importing" && currentStep === "summary");
            const isPast = steps.findIndex(s => s.id === currentStep) > index || currentStep === "summary";
            
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
          <FileUploader 
            title="Upload lab job data"
            description="Upload your .csv or .xlsx lab job list. Ensure you include an Invoice Number for each job."
            onComplete={handleFileUpload}
            onDownloadTemplate={handleDownloadTemplate}
          />
        )}
        {currentStep === "map" && (
          <MappingTable 
            fields={allFields}
            headers={parsedHeaders} 
            rawData={parsedData} 
            onComplete={handleMappingComplete}
            onBack={() => setCurrentStep("upload")}
          />
        )}
        {currentStep === "preview" && (
          <ImportPreview 
            fields={allFields}
            data={mappedData} 
            onConfirm={startImport}
            onBack={() => setCurrentStep("map")}
          />
        )}
        {currentStep === "importing" && (
          <ImportProgress 
            current={importProgress} 
            total={mappedData.filter(row => allFields.filter(f => f.isRequired).every(f => !!row[f.id])).length} 
          />
        )}
        {currentStep === "summary" && (
          <ImportSummary 
            result={importResult}
            onFinish={() => router.push("/lab-jobs")}
          />
        )}
      </div>
    </PageContainer>
  );
}
