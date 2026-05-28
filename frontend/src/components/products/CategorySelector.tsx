"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

interface CategorySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  error?: boolean;
}

export function CategorySelector({ value, onValueChange, error }: CategorySelectorProps) {
  return (
    <Select value={value} onValueChange={(val) => { if (val) onValueChange(val); }}>
      <SelectTrigger className={error ? "border-destructive" : ""}>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {MOCK_CATEGORIES.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
