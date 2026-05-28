"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomerHeader } from "@/components/customers/CustomerHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FileUploader } from "@/components/shared/import/FileUploader";
import { MappingTable, ImportFieldDef } from "@/components/shared/import/MappingTable";
import { ImportPreview } from "@/components/shared/import/ImportPreview";
import { ImportProgress } from "@/components/shared/import/ImportProgress";
import { ImportSummary, ImportResult } from "@/components/shared/import/ImportSummary";
import { SettingsService } from "@/services/settings.service";
import { CustomerService } from "@/services/customer.service";
import { exportToCSV } from "@/lib/export";
import { useRouter } from "next/navigation";

type ImportWizardStep = "upload" | "map" | "preview" | "importing" | "summary";

const SYSTEM_FIELDS: ImportFieldDef[] = [
  { id: "fullName", label: "Full Name", required: true },
  { id: "phone", label: "Phone", required: true },
  { id: "email", label: "Email" },
  { id: "address", label: "Address" },
  { id: "notes", label: "Notes" },
  { id: "gender", label: "Gender" }
];

export default function CustomerImportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ImportWizardStep>("upload");
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [mappedData, setMappedData] = useState<Record<string, any>[]>([]);
  
  const [allFields, setAllFields] = useState<ImportFieldDef[]>(SYSTEM_FIELDS);
  
  // Import tracking
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult>({ successCount: 0, invalidCount: 0, failedRows: [] });

  useEffect(() => {
    // Load custom fields to append to system fields
    SettingsService.getSettings()
      .then(res => {
        const customFields = res.customFieldDefinitions?.customers || [];
        const dynamicFields = customFields.map(f => ({
          id: f.id,
          label: f.name,
          required: f.required
        }));
        setAllFields([...SYSTEM_FIELDS, ...dynamicFields]);
      })
      .catch(console.error);
  }, []);

  const handleDownloadTemplate = () => {
    const columns = allFields.map(f => ({ header: f.label, key: f.id }));
    const sampleData = [
      allFields.reduce((acc, f) => ({ ...acc, [f.id]: f.required ? "Sample Data" : "" }), {})
    ];
    exportToCSV(sampleData, columns, "customer_import_template");
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
      return allFields.filter(f => f.required).every(f => !!row[f.id]);
    });
    const invalidCount = mappedData.length - validRows.length;

    let successCount = 0;
    const failedRows: { index: number; reason: string }[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setImportProgress(i + 1);

      try {
        // Construct the payload matching ApiCustomer structure
        const payload: any = {
          fullName: row.fullName,
          phone: row.phone,
          email: row.email || undefined,
          address: row.address || undefined,
          notes: row.notes || undefined,
          gender: row.gender || undefined,
          customFields: {}
        };

        // Extract custom fields from the row
        allFields.forEach(f => {
          if (!SYSTEM_FIELDS.find(sf => sf.id === f.id) && row[f.id] !== undefined && row[f.id] !== null) {
            payload.customFields[f.id] = row[f.id];
          }
        });

        await CustomerService.createCustomer(payload);
        successCount++;
      } catch (err: any) {
        failedRows.push({ index: i + 1, reason: err.message || "Unknown API error" });
      }
    }

    setImportResult({ successCount, invalidCount, failedRows });
    setCurrentStep("summary");
  };

  const steps = [
    { id: "upload", name: "1. Upload File" },
    { id: "map", name: "2. Map Columns" },
    { id: "preview", name: "3. Preview Data" },
    { id: "importing", name: "4. Import" }
  ];

  return (
    <PageContainer title="Import Customers" description="Bulk upload customers via CSV or XLSX.">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <CustomerHeader title="Bulk Import Customers" />
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
            title="Upload customer data"
            description="Upload your .csv or .xlsx customer list. The first row must contain column headers."
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
            total={mappedData.filter(row => allFields.filter(f => f.required).every(f => !!row[f.id])).length} 
          />
        )}
        {currentStep === "summary" && (
          <ImportSummary 
            result={importResult}
            onFinish={() => router.push("/customers")}
          />
        )}
      </div>
    </PageContainer>
  );
}
