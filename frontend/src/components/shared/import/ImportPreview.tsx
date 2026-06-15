import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, AlertCircle, AlertTriangle } from "lucide-react";
import { ImportFieldDef } from "./MappingTable";

interface ImportPreviewProps {
  fields: ImportFieldDef[];
  data: Record<string, any>[];
  onConfirm: () => void;
  onBack: () => void;
}

export function ImportPreview({ fields, data, onConfirm, onBack }: ImportPreviewProps) {
  // Find duplicates
  const emailCounts: Record<string, number> = {};
  const phoneCounts: Record<string, number> = {};
  
  data.forEach(row => {
    if (row.email) emailCounts[row.email] = (emailCounts[row.email] || 0) + 1;
    if (row.phone) phoneCounts[row.phone] = (phoneCounts[row.phone] || 0) + 1;
  });

  // Validate data against required fields and check duplicates
  const validatedData: (Record<string, any> & { _isValid: boolean; _missingFields: string[]; _isDuplicate: boolean; _duplicateFields: string[] })[] = data.map(row => {
    const missingFields = fields
      .filter(f => f.isRequired && !row[f.id])
      .map(f => f.label);
    
    const duplicateFields = [];
    if (row.email && emailCounts[row.email] > 1) duplicateFields.push("Email");
    if (row.phone && phoneCounts[row.phone] > 1) duplicateFields.push("Phone");
    
    return {
      ...row,
      _isValid: missingFields.length === 0,
      _missingFields: missingFields,
      _isDuplicate: duplicateFields.length > 0,
      _duplicateFields: duplicateFields
    };
  });

  const validCount = validatedData.filter(r => r._isValid).length;
  const invalidCount = validatedData.length - validCount;
  const duplicateCount = validatedData.filter(r => r._isDuplicate).length;

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Preview Data</h3>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] bg-green-50/50 border border-green-200 p-4 rounded-lg flex items-center gap-3">
          <div className="bg-green-100 text-green-700 p-2 rounded-full">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{validCount}</div>
            <div className="text-sm text-green-600 font-medium">Valid rows</div>
          </div>
        </div>
        
        {duplicateCount > 0 && (
          <div className="flex-1 min-w-[200px] bg-amber-50/50 border border-amber-200 p-4 rounded-lg flex items-center gap-3">
            <div className="bg-amber-100 text-amber-700 p-2 rounded-full">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-700">{duplicateCount}</div>
              <div className="text-sm text-amber-600 font-medium">Rows with duplicates (warning)</div>
            </div>
          </div>
        )}

        {invalidCount > 0 && (
          <div className="flex-1 min-w-[200px] bg-red-50/50 border border-red-200 p-4 rounded-lg flex items-center gap-3">
            <div className="bg-red-100 text-red-700 p-2 rounded-full">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-700">{invalidCount}</div>
              <div className="text-sm text-red-600 font-medium">Rows with errors (skipped)</div>
            </div>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto mb-6">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium w-8"></th>
              {fields.map(f => (
                <th key={f.id} className="px-4 py-3 font-medium whitespace-nowrap">
                  {f.label} {f.isRequired && <span className="text-destructive">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validatedData.map((row, i) => (
              <tr key={i} className={`border-b last:border-0 ${!row._isValid ? "bg-red-50/30" : row._isDuplicate ? "bg-amber-50/30" : ""}`}>
                <td className="px-4 py-3">
                  {!row._isValid ? (
                    <div title={`Missing: ${row._missingFields.join(', ')}`}>
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </div>
                  ) : row._isDuplicate ? (
                    <div title={`Duplicate in file: ${row._duplicateFields.join(', ')}`}>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                  ) : (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </td>
                {fields.map(f => (
                  <td key={f.id} className="px-4 py-3 truncate max-w-[200px]" title={row[f.id]}>
                    {row[f.id] || <span className="text-muted-foreground italic">-</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onConfirm} disabled={validCount === 0}>
          Start Import ({validCount} rows)
        </Button>
      </div>
    </div>
  );
}
