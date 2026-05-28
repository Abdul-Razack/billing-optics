import { FieldType } from "@/types/custom-field";
import { Type, Hash, List, CheckSquare, AlignLeft, Calendar, Palette, Copy } from "lucide-react";

export function getFieldTypeIcon(type: FieldType) {
  switch (type) {
    case "TEXT": return <Type className="h-4 w-4" />;
    case "NUMBER": return <Hash className="h-4 w-4" />;
    case "DROPDOWN": return <List className="h-4 w-4" />;
    case "CHECKBOX": return <CheckSquare className="h-4 w-4" />;
    case "TEXTAREA": return <AlignLeft className="h-4 w-4" />;
    case "DATE": return <Calendar className="h-4 w-4" />;
    case "COLOR": return <Palette className="h-4 w-4" />;
    case "MULTI_SELECT": return <Copy className="h-4 w-4" />;
    default: return <Type className="h-4 w-4" />;
  }
}

export function getFieldTypeLabel(type: FieldType) {
  switch (type) {
    case "TEXT": return "Text Input";
    case "NUMBER": return "Number Input";
    case "DROPDOWN": return "Dropdown Select";
    case "CHECKBOX": return "Checkbox";
    case "TEXTAREA": return "Textarea";
    case "DATE": return "Date Picker";
    case "COLOR": return "Color Picker";
    case "MULTI_SELECT": return "Multi-Select Dropdown";
    default: return type;
  }
}

interface FieldTypeSelectorProps {
  value: FieldType;
  onChange: (value: FieldType) => void;
}

export function FieldTypeSelector({ value, onChange }: FieldTypeSelectorProps) {
  const types: FieldType[] = [
    "TEXT", "NUMBER", "DROPDOWN", "CHECKBOX", 
    "TEXTAREA", "DATE", "COLOR", "MULTI_SELECT"
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {types.map((type) => {
        const isSelected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
              isSelected 
                ? "border-primary bg-primary/5 text-primary shadow-sm" 
                : "border-border bg-card hover:bg-muted/50 hover:border-primary/50 text-muted-foreground"
            }`}
          >
            <div className={`mb-2 p-2 rounded-full ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
              {getFieldTypeIcon(type)}
            </div>
            <span className="text-xs font-medium text-center">{getFieldTypeLabel(type)}</span>
          </button>
        );
      })}
    </div>
  );
}
