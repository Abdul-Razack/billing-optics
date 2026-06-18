"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DynamicFieldRendererProps {
  fieldDef: any; // Using any for now to represent product_attribute_definitions
  value: any;
  onChange: (val: any) => void;
  onAddOption?: (fieldId: number) => void; // New prop for inline creation
}

export function DynamicFieldRenderer({ fieldDef, value, onChange, onAddOption }: DynamicFieldRendererProps) {
  switch (fieldDef.inputType) {
    case "TEXT":
      return (
        <Input 
          type="text" 
          placeholder={`Enter ${fieldDef.label.toLowerCase()}`}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
        />
      );
    case "NUMBER":
      return (
        <Input 
          type="number" 
          placeholder={`Enter ${fieldDef.label.toLowerCase()}`}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} 
        />
      );
    case "BOOLEAN":
      return (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id={`attr-${fieldDef.id}`} 
            checked={!!value} 
            onCheckedChange={onChange} 
          />
          <label htmlFor={`attr-${fieldDef.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {fieldDef.label}
          </label>
        </div>
      );
    case "SELECT":
      return (
        <div className="flex gap-2">
          <Select value={value || ""} onValueChange={(val) => { if (val) onChange(val); }}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={`Select ${fieldDef.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldDef.options?.map((opt: any) => (
                <SelectItem key={opt.id} value={opt.value}>{opt.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {onAddOption && (
            <Button type="button" variant="outline" size="icon" onClick={() => onAddOption(fieldDef.id)} title="Add missing option">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    default:
      return null;
  }
}
