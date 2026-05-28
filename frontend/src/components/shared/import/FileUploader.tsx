import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileType, X, Download } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface FileUploaderProps {
  title?: string;
  description?: string;
  onComplete: (file: File, headers: string[], data: any[]) => void;
  onDownloadTemplate?: () => void;
}

export function FileUploader({ 
  title = "Upload your file", 
  description = "Drag and drop your CSV or Excel file here, or click to browse.",
  onComplete,
  onDownloadTemplate
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            setError("Failed to parse CSV file.");
            return;
          }
          if (results.meta.fields) {
            onComplete(file, results.meta.fields, results.data);
          } else {
            setError("Could not detect headers in CSV.");
          }
        },
        error: (err) => {
          setError(err.message);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (json.length < 2) {
            setError("Excel file must contain headers and at least one row of data.");
            return;
          }
          
          const headers = json[0] as string[];
          const rows = XLSX.utils.sheet_to_json(worksheet); // parses with headers
          
          onComplete(file, headers, rows as any[]);
        } catch (err) {
          setError("Failed to parse Excel file.");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError("Please upload a .csv or .xlsx file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-8 relative">
      {onDownloadTemplate && (
        <div className="absolute top-4 right-4">
          <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>
      )}
      <div 
        className={`border-2 border-dashed rounded-xl p-12 mt-6 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept=".csv, .xlsx, .xls"
          className="hidden" 
          onChange={handleChange}
        />
        
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          {description}
        </p>
        
        <Button onClick={() => inputRef.current?.click()}>
          Select File
        </Button>
        
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileType className="w-4 h-4" />
            <span>.CSV</span>
          </div>
          <div className="flex items-center gap-2">
            <FileType className="w-4 h-4" />
            <span>.XLSX</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 rounded-md bg-destructive/10 text-destructive flex items-center gap-2 border border-destructive/20">
          <X className="w-4 h-4" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
