"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldTypeSelector } from "./FieldTypeSelector";
import { Save, Plus, X } from "lucide-react";
import { FieldType, CustomField } from "@/types/custom-field";
import { useEffect, useState } from "react";

const fieldSchema = z.object({
  name: z.string().min(2, "Field name must be at least 2 characters"),
  key: z.string().min(2, "Key is required").regex(/^[a-z0-9_]+$/, "Key can only contain lowercase letters, numbers, and underscores"),
  type: z.enum(["TEXT", "NUMBER", "DROPDOWN", "CHECKBOX", "TEXTAREA", "DATE", "COLOR", "MULTI_SELECT"]),
  entityTarget: z.enum(["PRODUCT", "CUSTOMER"]),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  isRequired: z.boolean(),
  isActive: z.boolean(),
});

type FieldValues = z.infer<typeof fieldSchema>;

interface DynamicFieldBuilderProps {
  initialData?: Partial<CustomField>;
  onConfigChange: (config: Partial<CustomField>) => void;
  onSave: (config: CustomField) => void;
  onCancel: () => void;
}

export function DynamicFieldBuilder({ initialData, onConfigChange, onSave, onCancel }: DynamicFieldBuilderProps) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: initialData?.name || "",
      key: initialData?.key || "",
      type: initialData?.type || "TEXT",
      entityTarget: initialData?.entityTarget || "PRODUCT",
      placeholder: initialData?.placeholder || "",
      defaultValue: initialData?.defaultValue || "",
      isRequired: initialData?.isRequired || false,
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const [options, setOptions] = useState<string[]>(initialData?.options || []);
  const [newOption, setNewOption] = useState("");

  const currentValues = useWatch({ control: form.control });

  useEffect(() => {
    onConfigChange({
      ...currentValues,
      type: currentValues.type as FieldType,
      options
    });
  }, [currentValues, options, onConfigChange]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("name", val);
    
    // Auto-generate key if it's empty or was auto-generated
    if (!initialData?.key) {
      form.setValue("key", val.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, ""));
    }
  };

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const onSubmit = (values: FieldValues) => {
    const newField: CustomField = {
      id: initialData?.id || `cf_${values.key}`,
      key: values.key,
      name: values.name,
      type: values.type as FieldType,
      entityTarget: values.entityTarget as any,
      isRequired: values.isRequired,
      isActive: values.isActive,
      options: options,
      defaultValue: values.defaultValue,
      placeholder: values.placeholder,
      createdAt: initialData?.createdAt || new Date().toISOString()
    };
    onSave(newField);
  };

  const needsOptions = form.watch("type") === "DROPDOWN" || form.watch("type") === "MULTI_SELECT";

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col h-full">
      <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-medium">Field Configuration</h3>
          <p className="text-sm text-muted-foreground">Define the properties of the custom field.</p>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <form id="field-builder-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">1. Basic Info</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entity Target <span className="text-destructive">*</span></Label>
                <Controller
                  control={form.control}
                  name="entityTarget"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRODUCT">Product</SelectItem>
                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Field Name <span className="text-destructive">*</span></Label>
                <Input 
                  placeholder="e.g., Lens Material" 
                  {...form.register("name")}
                  onChange={handleNameChange}
                  className={form.formState.errors.name ? "border-destructive" : ""}
                />
                {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Field Key <span className="text-destructive">*</span></Label>
                <Input 
                  placeholder="e.g., lens_material" 
                  {...form.register("key")}
                  className={form.formState.errors.key ? "border-destructive font-mono text-sm" : "font-mono text-sm"}
                />
                <p className="text-xs text-muted-foreground">A unique identifier used internally and via API.</p>
                {form.formState.errors.key && <p className="text-xs text-destructive">{form.formState.errors.key.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">2. Field Type</h4>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <FieldTypeSelector 
                  value={field.value as FieldType} 
                  onChange={(val) => field.onChange(val)} 
                />
              )}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">3. Display & Validation</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placeholder Text</Label>
                <Input 
                  placeholder="e.g., Enter material..." 
                  {...form.register("placeholder")}
                />
              </div>

              <div className="space-y-2">
                <Label>Default Value</Label>
                <Input 
                  placeholder="e.g., CR-39" 
                  {...form.register("defaultValue")}
                />
              </div>
            </div>

            {needsOptions && (
              <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                <Label>Dropdown Options</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type an option and press Add" 
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  />
                  <Button type="button" onClick={addOption} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-1 bg-background border px-2 py-1 rounded text-sm">
                        {opt}
                        <button type="button" onClick={() => removeOption(i)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-md border border-border">
              <div>
                <Label className="text-base">Required Field</Label>
                <p className="text-sm text-muted-foreground">Users must fill this field before saving.</p>
              </div>
              <Controller
                control={form.control}
                name="isRequired"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-md border border-border">
              <div>
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">If disabled, the field {"won't"} appear in new forms.</p>
              </div>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="bg-muted/30 px-6 py-4 border-t border-border flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" form="field-builder-form">
          <Save className="mr-2 h-4 w-4" />
          Save Field
        </Button>
      </div>
    </div>
  );
}
