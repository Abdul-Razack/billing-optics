"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CategorySelector } from "./CategorySelector";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";
import { MOCK_CUSTOM_FIELDS } from "@/lib/mock-data";
import { Product } from "@/types/product";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(2, "SKU is required"),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  costPrice: z.number().min(0, "Must be >= 0"),
  sellingPrice: z.number().min(0, "Must be >= 0"),
  gstPercent: z.number().min(0).max(100),
  minStockAlert: z.number().min(0),
  isActive: z.boolean(),
  customFields: z.record(z.any()).optional(),
});

type ProductValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  
  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      costPrice: initialData?.costPrice || 0,
      sellingPrice: initialData?.sellingPrice || 0,
      gstPercent: initialData?.gstPercent || 0,
      minStockAlert: initialData?.minStockAlert || 5,
      isActive: initialData?.isActive ?? true,
      customFields: initialData?.customFields || {},
    },
  });

  const onSubmit = (values: ProductValues) => {
    console.log("Mock form submission:", values);
    router.push("/products");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
          <Input {...form.register("name")} />
          {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <CategorySelector value={field.value} onValueChange={field.onChange} error={!!form.formState.errors.categoryId} />
            )}
          />
          {form.formState.errors.categoryId && <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">SKU <span className="text-destructive">*</span></label>
          <Input {...form.register("sku")} />
          {form.formState.errors.sku && <p className="text-xs text-destructive">{form.formState.errors.sku.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Barcode</label>
          <Input {...form.register("barcode")} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea {...form.register("description")} className="min-h-[100px]" />
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Cost Price</label>
          <Input type="number" step="0.01" {...form.register("costPrice", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Selling Price</label>
          <Input type="number" step="0.01" {...form.register("sellingPrice", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">GST (%)</label>
          <Input type="number" {...form.register("gstPercent", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Min Stock Alert</label>
          <Input type="number" {...form.register("minStockAlert", { valueAsNumber: true })} />
        </div>
      </div>

      {/* Dynamic Fields */}
      {MOCK_CUSTOM_FIELDS.length > 0 && (
        <div>
          <h3 className="text-lg font-medium border-b border-border pb-2 mb-4">Attributes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CUSTOM_FIELDS.map((field) => (
              <div key={field.id} className={field.type === "textarea" ? "md:col-span-3 space-y-2" : "space-y-2"}>
                {field.type !== "checkbox" && (
                  <label className="text-sm font-medium">
                    {field.name} {field.required && <span className="text-destructive">*</span>}
                  </label>
                )}
                <Controller
                  control={form.control}
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
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Active Status</label>
          <p className="text-xs text-muted-foreground">Inactive products will not appear in POS.</p>
        </div>
        <Controller
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit">{initialData ? "Save Changes" : "Create Product"}</Button>
      </div>
    </form>
  );
}
