"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface ProductSearchInputProps {
  initialValue: string;
  onSearch: (value: string) => void;
  isSearching?: boolean;
}

export function ProductSearchInput({ initialValue, onSearch, isSearching = false }: ProductSearchInputProps) {
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);

  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setValue(initialValue);
  }
  const debouncedValue = useDebounce(value, 400);

  // Trigger search on debounce
  useEffect(() => {
    if (debouncedValue !== initialValue) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, initialValue, onSearch]);

  return (
    <div className="relative w-full sm:w-[280px] lg:w-[350px]">
      {isSearching ? (
        <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        placeholder="Search by name, SKU, or Barcode..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-8 w-full transition-all focus-visible:ring-primary/50"
      />
    </div>
  );
}
