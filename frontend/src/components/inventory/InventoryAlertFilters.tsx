import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ApiCategory } from "@/services/category.service";

interface InventoryAlertFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
  categories: ApiCategory[];
}

export function InventoryAlertFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  severityFilter,
  onSeverityFilterChange,
  categories
}: InventoryAlertFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
      <div className="flex-1 w-full md:max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search SKU or Name..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Select value={categoryFilter} onValueChange={(v: string | null) => { if (v) onCategoryFilterChange(v) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={(v: string | null) => { if (v) onSeverityFilterChange(v) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alert Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="EMERGENCY">Emergency (0 Stock)</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="WARNING">Warning</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
