"use client";

import { useState } from "react";
import { 
  Check, 
  ChevronsUpDown, 
  Glasses, 
  SunMedium, 
  Eye, 
  Disc, 
  Droplets, 
  Package, 
  Gift, 
  Layers 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ApiCategory } from "@/services/category.service";

interface CategorySelectorProps {
  categories: ApiCategory[];
  value?: number;
  onValueChange: (value: number) => void;
  error?: boolean;
}

export function getCategoryIcon(catName?: string) {
  if (!catName) return <Layers className="h-4 w-4" />;
  const lower = catName.toLowerCase();
  if (lower.includes("frame")) return <Glasses className="h-4 w-4" />;
  if (lower.includes("sunglass")) return <SunMedium className="h-4 w-4" />;
  if (lower.includes("contact")) return <Disc className="h-4 w-4" />;
  if (lower.includes("lens")) return <Eye className="h-4 w-4" />;
  if (lower.includes("solution")) return <Droplets className="h-4 w-4" />;
  if (lower.includes("non-chargeable") || lower.includes("non chargeable")) return <Gift className="h-4 w-4" />;
  if (lower.includes("other") || lower.includes("accessor")) return <Package className="h-4 w-4" />;
  return <Layers className="h-4 w-4" />;
}

const OPTICAL_CATEGORY_ORDER = ["frame", "sunglass", "lens", "contact", "solution", "other", "non-chargeable", "non chargeable"];

function getCategoryRank(name: string): number {
  const lower = name.toLowerCase();
  const idx = OPTICAL_CATEGORY_ORDER.findIndex((prefix) => lower.includes(prefix));
  return idx === -1 ? 99 : idx;
}

export function CategorySelector({ categories, value, onValueChange, error }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);

  const activeCategories = [...categories]
    .filter((c) => c.isActive !== false)
    .sort((a, b) => getCategoryRank(a.name) - getCategoryRank(b.name));
  const selectedCategory = activeCategories.find((cat) => cat.id === value);

  return (
    <div className="space-y-2.5">
      {/* Quick Category Selection Pills */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {activeCategories.map((cat) => {
          const isSelected = value === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onValueChange(cat.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 select-none border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-border"
              )}
            >
              {getCategoryIcon(cat.name)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Combobox fallback / detail dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal h-9 text-xs sm:text-sm bg-background",
              !value && "text-muted-foreground",
              error && "border-destructive ring-1 ring-destructive"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selectedCategory ? (
                <>
                  {getCategoryIcon(selectedCategory.name)}
                  <span className="font-medium text-foreground">{selectedCategory.name}</span>
                </>
              ) : (
                "Select a category..."
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search optical category..." />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {activeCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onValueChange(category.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.name)}
                      <span>{category.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary",
                        value === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
