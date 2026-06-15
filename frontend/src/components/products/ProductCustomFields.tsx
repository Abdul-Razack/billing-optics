"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CustomField } from "@/types/custom-field";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";

interface ProductCustomFieldsProps {
  customFields: CustomField[];
}

export function ProductCustomFields({ customFields }: ProductCustomFieldsProps) {
  const { control } = useFormContext();

  if (!customFields || customFields.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Attributes</CardTitle>
        <CardDescription>
          Dynamic fields defined in settings for your product catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customFields.map((field) => (
            <div 
              key={field.id} 
              className={field.type === "TEXTAREA" ? "md:col-span-2 lg:col-span-3 space-y-2" : "space-y-2"}
            >
              {field.type !== "CHECKBOX" && (
                <Label className="flex items-center gap-1">
                  {field.name} 
                  {field.isRequired && <span className="text-destructive">*</span>}
                </Label>
              )}
              <Controller
                control={control}
                name={`customFields.${field.id}`}
                render={({ field: controllerField }) => (
                  <DynamicFieldRenderer 
                    fieldDef={field}
                    value={controllerField.value}
                    onChange={controllerField.onChange}
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
