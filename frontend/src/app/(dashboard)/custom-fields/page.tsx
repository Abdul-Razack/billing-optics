"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { MOCK_CUSTOM_FIELDS } from "@/lib/mock-custom-field-data";
import { DynamicFieldCard } from "@/components/custom-fields/DynamicFieldCard";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CustomFieldsPage() {
  const [filter, setFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");

  const filteredFields = MOCK_CUSTOM_FIELDS.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(filter.toLowerCase()) || 
                          field.key.toLowerCase().includes(filter.toLowerCase());
    const matchesEntity = entityFilter === "ALL" || field.entityTarget === entityFilter;
    
    return matchesSearch && matchesEntity;
  });

  return (
    <PageContainer title="Custom Fields" description="Manage dynamic attributes for your system entities.">
      <ProductHeader 
        title="Field Definitions" 
        action={{ label: "Create Custom Field", href: "/custom-fields/new" }} 
      />

      <FilterBar globalFilter={filter} setGlobalFilter={setFilter} placeholder="Search fields by name or key...">
        <Select value={entityFilter} onValueChange={(val) => setEntityFilter(val || "ALL")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Entities</SelectItem>
            <SelectItem value="PRODUCT">Products Only</SelectItem>
            <SelectItem value="CUSTOMER">Customers Only</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {filteredFields.map(field => (
          <DynamicFieldCard key={field.id} field={field} />
        ))}
      </div>

      {filteredFields.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border border-dashed mt-6">
          <p className="text-muted-foreground">No custom fields found matching your filters.</p>
        </div>
      )}
    </PageContainer>
  );
}
