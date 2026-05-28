"use client";

import { CustomerCustomField } from "@/types/customer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DynamicCustomerFieldRendererProps {
  fieldDef: CustomerCustomField;
  value: any;
  onChange: (val: any) => void;
}

export function DynamicCustomerFieldRenderer({ fieldDef, value, onChange }: DynamicCustomerFieldRendererProps) {
  switch (fieldDef.type) {
    case "text":
      return (
        <Input 
          type="text" 
          placeholder={`Enter ${fieldDef.name.toLowerCase()}`}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
        />
      );
    case "number":
      return (
        <Input 
          type="number" 
          placeholder={`Enter ${fieldDef.name.toLowerCase()}`}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} 
        />
      );
    case "textarea":
      return (
        <Textarea 
          placeholder={`Enter ${fieldDef.name.toLowerCase()}`}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
          className="resize-none"
        />
      );
    case "checkbox":
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
    case "dropdown":
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
