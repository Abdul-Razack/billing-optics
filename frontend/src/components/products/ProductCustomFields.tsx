"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";

interface ProductCustomFieldsProps {
  customFields: any[]; // Using any for product_attribute_definitions
  onAddOption?: (fieldId: number) => void;
}

export function ProductCustomFields({ customFields, onAddOption }: ProductCustomFieldsProps) {
  const { control } = useFormContext();

  if (!customFields || customFields.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Attributes</CardTitle>
        <CardDescription>
          Dynamic fields specifically required for this category of product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customFields.map((field) => (
            <div 
              key={field.id} 
              className={field.inputType === "TEXTAREA" ? "md:col-span-2 lg:col-span-3 space-y-2" : "space-y-2"}
            >
              {field.inputType !== "BOOLEAN" && (
                <Label className="flex items-center gap-1">
                  {field.label} 
                  {field.isRequired && <span className="text-destructive">*</span>}
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
