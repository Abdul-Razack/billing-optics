"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface CustomerSearchProps {
  initialValue: string;
  onSearch: (value: string) => void;
  isSearching?: boolean;
}

export function CustomerSearch({ initialValue, onSearch, isSearching = false }: CustomerSearchProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 300);
  // Track previous initialValue to detect external resets without useEffect+setState
  const prevInitialRef = useRef(initialValue);
  if (prevInitialRef.current !== initialValue) {
    prevInitialRef.current = initialValue;
    setValue(initialValue);
  }

  // Trigger search on debounce
  useEffect(() => {
    if (debouncedValue !== initialValue) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, initialValue, onSearch]);

  return (
    <div className="relative w-full sm:w-[250px] lg:w-[350px]">
      {isSearching ? (
        <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        placeholder="Search by name, phone, email, or ID..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-8 w-full transition-all focus-visible:ring-primary/50"
      />
    </div>
  );
}
