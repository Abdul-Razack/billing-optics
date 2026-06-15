"use client";

import { CustomField } from "@/types/custom-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DynamicFieldRendererProps {
  fieldDef: CustomField;
  value: any;
  onChange: (val: any) => void;
}

export function DynamicFieldRenderer({ fieldDef, value, onChange }: DynamicFieldRendererProps) {
  switch (fieldDef.type) {
    case "TEXT":
      return (
        <Input 
          type="text" 
          placeholder={`Enter ${fieldDef.name.toLowerCase()}`}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
        />
      );
    case "NUMBER":
      return (
        <Input 
          type="number" 
          placeholder={`Enter ${fieldDef.name.toLowerCase()}`}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} 
        />
      );
    case "TEXTAREA":
      return (
        <Textarea 
          placeholder={`Enter ${fieldDef.name.toLowerCase()}`}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
          className="resize-none"
        />
      );
    case "CHECKBOX":
      return (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id={fieldDef.id} 
            checked={!!value} 
            onCheckedChange={onChange} 
          />
          <label htmlFor={fieldDef.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {fieldDef.name}
          </label>
        </div>
      );
    case "DROPDOWN":
      return (
        <Select value={value || ""} onValueChange={(val) => { if (val) onChange(val); }}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${fieldDef.name.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {fieldDef.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return null;
  }
}
