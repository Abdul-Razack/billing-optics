import { UploadCloud, FileSpreadsheet } from "lucide-react";

interface FileUploadZoneProps {
  onFileSelect: () => void;
  selectedFileName?: string;
}

export function FileUploadZone({ onFileSelect, selectedFileName }: FileUploadZoneProps) {
  return (
    <div 
      className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/30 hover:border-primary/50 transition-colors cursor-pointer bg-card"
      onClick={onFileSelect}
    >
      {selectedFileName ? (
        <>
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-foreground">{selectedFileName}</h3>
          <p className="text-sm text-muted-foreground mt-1">Click to replace file</p>
        </>
      ) : (
        <>
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Click or drag file to this area to upload</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.
          </p>
          <div className="flex gap-2 mt-4 text-xs font-medium text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded">.CSV</span>
            <span className="bg-muted px-2 py-1 rounded">.XLSX</span>
            <span className="bg-muted px-2 py-1 rounded">.XLS</span>
          </div>
        </>
      )}
    </div>
  );
}
