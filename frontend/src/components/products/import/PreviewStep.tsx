import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { ProductService } from "@/services/product.service";
import { MappedData } from "@/app/(dashboard)/products/import/page";
import { Badge } from "@/components/ui/badge";

interface PreviewStepProps {
  data: MappedData[];
  onConfirm: () => void;
  onBack: () => void;
}

interface ValidatedRow extends MappedData {
  _errors: string[];
  _isValid: boolean;
  _isDuplicateSku: boolean;
}

export function PreviewStep({ data, onConfirm, onBack }: PreviewStepProps) {
  const [validatedData, setValidatedData] = useState<ValidatedRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ valid: 0, invalid: 0, duplicates: 0 });

  useEffect(() => {
    const validate = async () => {
      try {
        const existingProducts = await ProductService.getProducts();
        const existingSkus = new Set(existingProducts.map(p => p.sku));

        let validCount = 0;
        let invalidCount = 0;
        let duplicateCount = 0;

        const validated = data.map((row, index) => {
          const errors: string[] = [];
          
          if (!row.sku) errors.push("Missing SKU");
          if (!row.name) errors.push("Missing Name");
          if (!row.category) errors.push("Missing Category");
          
          const cost = parseFloat(row.costPrice);
          if (row.costPrice && isNaN(cost)) errors.push("Cost Price must be a number");
          
          const sell = parseFloat(row.sellingPrice);
          if (row.sellingPrice && isNaN(sell)) errors.push("Selling Price must be a number");
          
          const isDup = row.sku ? existingSkus.has(row.sku) : false;
          if (isDup) {
            duplicateCount++;
          }

          const isValid = errors.length === 0;
          if (isValid) validCount++;
          else invalidCount++;

          return {
            ...row,
            _errors: errors,
            _isValid: isValid,
            _isDuplicateSku: isDup
          };
        });

        setValidatedData(validated);
        setStats({ valid: validCount, invalid: invalidCount, duplicates: duplicateCount });
      } catch (err) {
        console.error("Validation failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    validate();
  }, [data]);

  const hasErrors = stats.invalid > 0;

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">Preview & Validate Data</h3>
      <p className="text-muted-foreground mb-6">
        Review your data before importing. Rows with errors will be skipped during import.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border bg-card flex flex-col">
          <span className="text-sm text-muted-foreground">Total Rows</span>
          <span className="text-2xl font-semibold">{data.length}</span>
        </div>
        <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20 flex flex-col">
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Valid Rows</span>
          <span className="text-2xl font-semibold text-green-600 dark:text-green-400">{stats.valid}</span>
        </div>
        <div className="p-4 rounded-lg border bg-destructive/10 border-destructive/20 flex flex-col">
          <span className="text-sm text-destructive font-medium">Invalid / Duplicates</span>
          <span className="text-2xl font-semibold text-destructive">{stats.invalid} / {stats.duplicates}</span>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto mb-6">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Validating data...</TableCell>
              </TableRow>
            ) : validatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No data found to preview.</TableCell>
              </TableRow>
            ) : (
              validatedData.slice(0, 100).map((row, i) => (
                <TableRow key={i} className={!row._isValid ? "bg-destructive/5" : ""}>
                  <TableCell>
                    {row._isValid && !row._isDuplicateSku && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {!row._isValid && (
                      <div className="flex items-center text-destructive" title={row._errors.join(", ")}>
                        <AlertCircle className="w-5 h-5 mr-1" />
                        <span className="text-xs font-medium border border-destructive/30 px-1.5 py-0.5 rounded bg-destructive/10">Error</span>
                      </div>
                    )}
                    {row._isValid && row._isDuplicateSku && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Duplicate</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{row.sku}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="text-right">{row.sellingPrice}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {validatedData.length > 100 && (
          <div className="p-2 text-center text-xs text-muted-foreground bg-muted/30">
            Showing first 100 rows.
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Button onClick={onConfirm} disabled={isLoading || stats.valid === 0}>
            Confirm & Import
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
