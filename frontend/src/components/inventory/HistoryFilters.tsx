import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface HistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

export function HistoryFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
      <div className="flex-1 w-full md:max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search Product, SKU or ID..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Select value={typeFilter} onValueChange={(v: string | null) => { if (v) onTypeFilterChange(v) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Movement Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Movements</SelectItem>
            <SelectItem value="ADD">Added Stock (+)</SelectItem>
            <SelectItem value="REDUCE">Reduced Stock (-)</SelectItem>
            <SelectItem value="REPLACE">Correction (=)</SelectItem>
            <SelectItem value="DAMAGE">Damaged (-)</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
