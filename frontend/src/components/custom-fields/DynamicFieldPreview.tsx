import { CustomField } from "@/types/custom-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DynamicFieldPreviewProps {
  fieldConfig: Partial<CustomField>;
}

export function DynamicFieldPreview({ fieldConfig }: DynamicFieldPreviewProps) {
  const { 
    name = "Field Name", 
    type = "TEXT", 
    placeholder = "Placeholder text", 
    isRequired = false,
    defaultValue = "",
    options = []
  } = fieldConfig;

  const displayLabel = name || "Field Name";

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-muted/30 px-6 py-4 border-b border-border">
        <h3 className="font-medium">Live Preview</h3>
        <p className="text-sm text-muted-foreground">This is how the field will appear in forms.</p>
      </div>
      
      <div className="p-6 flex-1 flex items-center justify-center bg-dot-pattern bg-gray-50/50">
        <div className="w-full max-w-sm bg-background p-6 rounded-lg border shadow-sm">
          <div className="space-y-3">
            <Label className="flex items-center gap-1 text-base">
              {displayLabel}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>

            {type === "TEXT" && (
              <Input placeholder={placeholder} defaultValue={defaultValue} readOnly />
            )}

            {type === "NUMBER" && (
              <Input type="NUMBER" placeholder={placeholder} defaultValue={defaultValue} readOnly />
            )}

            {type === "TEXTAREA" && (
              <Textarea placeholder={placeholder} defaultValue={defaultValue} className="resize-none" readOnly />
            )}

            {type === "DROPDOWN" && (
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {(options.length > 0 ? options : ["Option 1", "Option 2"]).map((opt, i) => (
                    <SelectItem key={i} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {type === "MULTI_SELECT" && (
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder || "Select multiple options"} />
                </SelectTrigger>
                <SelectContent>
                  {(options.length > 0 ? options : ["Option 1", "Option 2"]).map((opt, i) => (
                    <SelectItem key={i} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {type === "CHECKBOX" && (
              <div className="flex items-center space-x-2">
                <Checkbox id="preview-checkbox" disabled defaultChecked={defaultValue === "true"} />
                <label
                  htmlFor="preview-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Yes
                </label>
              </div>
            )}

            {type === "DATE" && (
              <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground" disabled>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {placeholder || "Pick a date"}
              </Button>
            )}

            {type === "COLOR" && (
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded border" 
                  style={{ backgroundColor: defaultValue || "#000000" }}
                />
                <Input value={defaultValue || "#000000"} readOnly className="flex-1 font-mono uppercase" />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Internal Key: <code className="bg-muted px-1 py-0.5 rounded text-primary">{fieldConfig.key || "field_key"}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
