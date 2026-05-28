import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ADJUSTMENT_REASONS = [
  { value: "restock", label: "Supplier Restock" },
  { value: "return", label: "Customer Return" },
  { value: "damage", label: "Damaged / Broken" },
  { value: "loss", label: "Lost / Stolen" },
  { value: "correction", label: "Inventory Count Correction" },
  { value: "internal", label: "Internal Use" },
  { value: "other", label: "Other (Specify in notes)" },
];

interface AdjustmentReasonSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AdjustmentReasonSelector({ value, onChange }: AdjustmentReasonSelectorProps) {
  return (
    <Select value={value} onValueChange={(val: string | null) => { if (val) onChange(val); }}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a reason for adjustment" />
      </SelectTrigger>
      <SelectContent>
        {ADJUSTMENT_REASONS.map((reason) => (
          <SelectItem key={reason.value} value={reason.value}>
            {reason.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
