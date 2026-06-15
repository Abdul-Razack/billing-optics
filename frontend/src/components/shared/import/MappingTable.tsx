import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

export interface ImportFieldDef {
  id: string;
  label: string;
  isRequired?: boolean;
}

interface MappingTableProps {
  fields: ImportFieldDef[];
  headers: string[];
  rawData: any[];
  onComplete: (mapping: Record<string, string>, mappedData: Record<string, any>[]) => void;
  onBack: () => void;
}

const getInitialMapping = (fields: ImportFieldDef[], headers: string[]) => {
  let initialMapping: Record<string, string> | null = null;
  if (typeof window !== "undefined") {
    const savedTemplate = localStorage.getItem("import_mapping_template");
    if (savedTemplate) {
      try {
        const parsed = JSON.parse(savedTemplate);
        // Only use saved mapping if the headers match what's saved
        const hasMatchingHeaders = Object.values(parsed).some(val => headers.includes(val as string));
        if (hasMatchingHeaders) {
          initialMapping = parsed;
        }
      } catch (e) {}
    }
  }

  const newMapping: Record<string, string> = { ...initialMapping };

  // Auto-map based on similar names for fields not mapped by template
  const lowerHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  fields.forEach(field => {
    if (!newMapping[field.id] || !headers.includes(newMapping[field.id])) {
      const fieldIdLower = field.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fieldLabelLower = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const matchIndex = lowerHeaders.findIndex(h => h === fieldIdLower || h === fieldLabelLower);
      if (matchIndex !== -1) {
        newMapping[field.id] = headers[matchIndex];
      }
    }
  });
  return newMapping;
};

export function MappingTable({ fields, headers, rawData, onComplete, onBack }: MappingTableProps) {
  const [prevHeaders, setPrevHeaders] = useState<string[]>(headers);
  const [mapping, setMapping] = useState<Record<string, string>>(() => getInitialMapping(fields, headers));

  if (headers !== prevHeaders) {
    setPrevHeaders(headers);
    setMapping(getInitialMapping(fields, headers));
  }

  const handleNext = () => {
    // Transform data
    const mappedData = rawData.map(row => {
      const newRow: any = {};
      fields.forEach(field => {
        const fileColumn = mapping[field.id];
        if (fileColumn && row[fileColumn] !== undefined) {
          newRow[field.id] = row[fileColumn];
        } else {
          newRow[field.id] = null;
        }
      });
      return newRow;
    });

    onComplete(mapping, mappedData);
  };

  const handleSaveTemplate = () => {
    localStorage.setItem("import_mapping_template", JSON.stringify(mapping));
    toast.success("Mapping template saved successfully.");
  };

  const isMappingValid = fields.filter(f => f.isRequired).every(f => !!mapping[f.id]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold">Map Columns</h3>
          <p className="text-muted-foreground mt-1">
            Match the columns from your uploaded file to the corresponding fields in the system.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
          <Save className="w-4 h-4 mr-2" />
          Save Mapping Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8 max-h-[500px] overflow-y-auto pr-4 mt-8">
        {fields.map(field => (
          <div key={field.id} className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg border bg-card">
            <div className="col-span-1">
              <Label className="font-medium text-sm flex items-center">
                {field.label}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            <div className="col-span-2">
              <Select 
                value={mapping[field.id] || "unmapped"} 
                onValueChange={(val) => setMapping(prev => ({ ...prev, [field.id]: val === "unmapped" ? "" : String(val) }))}
              >
                <SelectTrigger className={!mapping[field.id] && field.isRequired ? "border-destructive/50" : ""}>
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unmapped" className="text-muted-foreground italic">-- Do not map --</SelectItem>
                  {headers.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          {!isMappingValid && (
            <span className="text-sm text-destructive">Please map all required fields.</span>
          )}
          <Button onClick={handleNext} disabled={!isMappingValid}>
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
