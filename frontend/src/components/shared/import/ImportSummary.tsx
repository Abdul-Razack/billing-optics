import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";

export interface ImportResult {
  successCount: number;
  invalidCount: number;
  failedRows: { index: number; reason: string }[];
}

interface ImportSummaryProps {
  result: ImportResult;
  onFinish: () => void;
  title?: string;
}

export function ImportSummary({ 
  result, 
  onFinish,
  title = "Import Complete"
}: ImportSummaryProps) {
  const hasErrors = result.failedRows.length > 0 || result.invalidCount > 0;
  const totalAttempted = result.successCount + result.failedRows.length;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${hasErrors ? (result.successCount > 0 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600") : "bg-green-100 text-green-600"}`}>
          {hasErrors ? (
            result.successCount > 0 ? <AlertTriangle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />
          ) : (
            <CheckCircle2 className="w-8 h-8" />
          )}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-2">
          {result.successCount} of {totalAttempted} records imported successfully.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600 mb-1">{result.successCount}</div>
          <div className="text-sm font-medium text-muted-foreground">Successful</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-amber-600 mb-1">{result.invalidCount}</div>
          <div className="text-sm font-medium text-muted-foreground">Skipped (Invalid)</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-red-600 mb-1">{result.failedRows.length}</div>
          <div className="text-sm font-medium text-muted-foreground">Failed API</div>
        </div>
      </div>

      {result.failedRows.length > 0 && (
        <div className="mb-8">
          <h4 className="font-semibold mb-3 flex items-center text-red-700">
            <XCircle className="w-4 h-4 mr-2" /> Failed Imports Log
          </h4>
          <div className="bg-red-50/50 border border-red-100 rounded-lg max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-100/50 text-red-800 text-left sticky top-0">
                <tr>
                  <th className="px-4 py-2 font-medium w-24">Row #</th>
                  <th className="px-4 py-2 font-medium">Error Reason</th>
                </tr>
              </thead>
              <tbody>
                {result.failedRows.map((err, i) => (
                  <tr key={i} className="border-t border-red-100">
                    <td className="px-4 py-2 text-red-900">Row {err.index}</td>
                    <td className="px-4 py-2 text-red-700">{err.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-center pt-4 border-t">
        <Button size="lg" onClick={onFinish}>
          Done <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
