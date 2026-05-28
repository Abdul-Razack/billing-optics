import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomField } from "@/types/custom-field";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ColumnMapperProps {
  sourceColumns: string[];
  systemFields: { key: string, name: string, isRequired: boolean }[];
  customFields: CustomField[];
  mappedColumns: Record<string, string>;
  onMappingChange: (sourceCol: string, targetKey: string) => void;
}

export function ColumnMapper({ sourceColumns, systemFields, customFields, mappedColumns, onMappingChange }: ColumnMapperProps) {
  // Combine core fields and custom fields for the dropdown
  const allTargetFields = [
    { group: "Core Fields", fields: systemFields },
    { group: "Custom Fields", fields: customFields.map(cf => ({ key: cf.key, name: cf.name, isRequired: cf.isRequired })) }
  ];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-medium">Uploaded File Column</th>
            <th className="px-6 py-3 font-medium">Map To System Field</th>
            <th className="px-6 py-3 font-medium text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sourceColumns.map((sourceCol, idx) => {
            const mappedValue = mappedColumns[sourceCol] || "unmapped";
            const isMapped = mappedValue !== "unmapped" && mappedValue !== "ignore";

            return (
              <tr key={idx} className="hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">{sourceCol}</td>
                <td className="px-6 py-4">
                  <Select value={mappedValue} onValueChange={(val) => onMappingChange(sourceCol, val || "")}>
                    <SelectTrigger className={`w-full max-w-sm ${isMapped ? "border-primary/50" : ""}`}>
                      <SelectValue placeholder="Select field to map..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unmapped" disabled>Select field...</SelectItem>
                      <SelectItem value="ignore" className="text-muted-foreground italic">-- Ignore this column --</SelectItem>
                      
                      {allTargetFields.map(group => (
                        <div key={group.group}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 mt-1 uppercase tracking-wider">
                            {group.group}
                          </div>
                          {group.fields.map(field => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.name} {field.isRequired && <span className="text-destructive ml-1">*</span>}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4 text-center">
                  {isMapped ? (
                    <div className="flex items-center justify-center text-green-600 gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Mapped</span>
                    </div>
                  ) : mappedValue === "ignore" ? (
                    <span className="text-xs text-muted-foreground">Ignored</span>
                  ) : (
                    <div className="flex items-center justify-center text-orange-500 gap-1.5">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Pending</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
