import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { MappedData } from "@/app/(dashboard)/products/import/page";
import Papa from "papaparse";
import { fetchClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface ConfirmStepProps {
  data: MappedData[];
  onComplete: () => void;
}

export function ConfirmStep({ data, onComplete }: ConfirmStepProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(true);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performUpload = async () => {
      try {
        // Generate CSV strictly matching backend expected headers
        // Backend bulk.controller looks for: sku, name, category, costPrice, sellingPrice, minStockAlert
        // And loops through other keys to add to attributes JSON
        
        const csvString = Papa.unparse(data);
        const blob = new Blob([csvString], { type: 'text/csv' });
        const file = new File([blob], 'import.csv', { type: 'text/csv' });

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetchClient<{ success: boolean; data: { imported: number; skipped: number; errors: string[] } }>("/products/bulk", {
          method: "POST",
          data: formData,
          // Need to let axios set the correct multipart/form-data headers automatically
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.success) {
          setResult(response.data);
        } else {
          setError("Upload failed. Please try again.");
        }
      } catch (err: any) {
        console.error("Upload error", err);
        setError(err.message || "An unexpected error occurred during upload.");
      } finally {
        setIsUploading(false);
      }
    };

    performUpload();
  }, [data]);

  return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
      {isUploading ? (
        <>
          <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
          <h3 className="text-2xl font-semibold mb-2">Importing Products...</h3>
          <p className="text-muted-foreground">Please do not close this window.</p>
        </>
      ) : error ? (
        <>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-destructive">Import Failed</h3>
          <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
          <Button onClick={onComplete} variant="outline">Start Over</Button>
        </>
      ) : result ? (
        <>
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Import Complete!</h3>
          
          <div className="flex gap-8 my-8 text-left border rounded-lg p-6 bg-card">
            <div>
              <p className="text-sm text-muted-foreground">Imported</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.imported}</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Skipped</p>
              <p className="text-3xl font-bold text-amber-500">{result.skipped}</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-3xl font-bold text-destructive">{result.errors.length}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="w-full max-w-lg text-left bg-destructive/5 rounded-md p-4 mb-8 max-h-[150px] overflow-y-auto border border-destructive/20 text-sm text-destructive">
              <p className="font-semibold mb-2">Error Log:</p>
              <ul className="list-disc pl-4 space-y-1">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={onComplete}>Import Another File</Button>
            <Button onClick={() => router.push("/products")}>View Products</Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
