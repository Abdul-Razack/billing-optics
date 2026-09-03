"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";
import { getCategoryIcon } from "./CategorySelector";
import { Sparkles } from "lucide-react";

interface ProductCustomFieldsProps {
  customFields: any[];
  categoryName?: string;
  onAddOption?: (fieldId: number) => void;
}

export function ProductCustomFields({ customFields, categoryName, onAddOption }: ProductCustomFieldsProps) {
  const { control } = useFormContext();

  if (!customFields || customFields.length === 0) {
    return null;
  }

  // Sort fields by displayOrder
  const sortedFields = [...customFields].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              {getCategoryIcon(categoryName)}
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <span>{categoryName || "Category"} Parameters</span>
                <Badge variant="outline" className="text-[11px] font-normal tracking-wide">
                  {sortedFields.length} attributes
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Optical specifications and product parameters for this category.
              </CardDescription>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Use <strong className="text-foreground">+</strong> to add options instantly</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {sortedFields.map((field) => (
            <div 
              key={field.id} 
              className={field.inputType === "TEXTAREA" ? "sm:col-span-2 lg:col-span-3 xl:col-span-4 space-y-1.5" : "space-y-1.5"}
            >
              {field.inputType !== "BOOLEAN" && (
                <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.isRequired ? (
                    <span className="text-[10px] text-destructive font-semibold uppercase">Required</span>
                  ) : null}
                </Label>
              )}
              <Controller
                control={control}
                name={`customFields.${field.name}`}
                render={({ field: controllerField }) => (
                  <DynamicFieldRenderer 
                    fieldDef={field}
                    value={controllerField.value}
                    onChange={controllerField.onChange}
                    onAddOption={onAddOption}
                  />
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
