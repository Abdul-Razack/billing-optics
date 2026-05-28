"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { ProductService, ApiProduct } from "@/services/product.service";
import { SettingsService } from "@/services/settings.service";
import { CustomField } from "@/types/product";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";
import { buildDynamicSchema } from "@/lib/dynamic-schema";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.number({ required_error: "Category is required", invalid_type_error: "Category is required" }).min(1, "Category is required"),
  description: z.string().optional(),
  costPrice: z.number().min(0, "Must be >= 0"),
  sellingPrice: z.number().min(0, "Must be >= 0"),
  gstPercent: z.number().min(0).max(100),
  minStockAlert: z.number().min(0),
  isActive: z.boolean(),
  customFields: z.record(z.any()).optional(),
});

type ProductValues = z.infer<typeof productSchema>;

interface ProductFormInnerProps {
  initialData?: ApiProduct;
  categories: ApiCategory[];
  customFields: CustomField[];
}

function ProductFormInner({ initialData, categories, customFields }: ProductFormInnerProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!initialData;
  const dynamicSchema = buildDynamicSchema(productSchema, customFields);
  type DynamicProductValues = z.infer<typeof dynamicSchema>;

  const form = useForm<DynamicProductValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      categoryId: initialData?.categoryId || 0,
      description: initialData?.description || "",
      costPrice: initialData?.costPrice || 0,
      sellingPrice: initialData?.sellingPrice || 0,
      gstPercent: initialData?.gstPercent ?? 18,
      minStockAlert: initialData?.minStockAlert ?? 5,
      isActive: initialData?.isActive ?? true,
      customFields: initialData?.attributes || {},
    },
  });

  const onSubmit = async (values: DynamicProductValues) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...(values as any),
        attributes: (values.customFields || {}) as Record<string, any>,
      };

      if (isEditMode && initialData) {
        await ProductService.updateProduct(initialData.id, payload);
      } else {
        await ProductService.createProduct(payload);
      }
      router.push("/products");
      router.refresh(); // Refresh list
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category <span className="text-destructive">*</span></Label>
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Select
                onValueChange={(val) => val && field.onChange(parseInt(val, 10))}
                value={field.value ? field.value.toString() : ""}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.categoryId && <p className="text-xs text-destructive">{form.formState.errors.categoryId.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...form.register("sku")} placeholder="Auto-generated if left blank" />
          {form.formState.errors.sku && <p className="text-xs text-destructive">{form.formState.errors.sku.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input id="barcode" {...form.register("barcode")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} className="min-h-[100px]" />
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price</Label>
          <Input id="costPrice" type="number" step="0.01" {...form.register("costPrice", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price</Label>
          <Input id="sellingPrice" type="number" step="0.01" {...form.register("sellingPrice", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gstPercent">GST (%)</Label>
          <Input id="gstPercent" type="number" {...form.register("gstPercent", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minStockAlert">Min Stock Alert</Label>
          <Input id="minStockAlert" type="number" {...form.register("minStockAlert", { valueAsNumber: true })} />
        </div>
      </div>

      {/* Dynamic Fields */}
      {customFields.length > 0 && (
        <div>
          <h3 className="text-lg font-medium border-b border-border pb-2 mb-4">Attributes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customFields.map((field) => (
              <div key={field.id} className={field.type === "textarea" ? "md:col-span-3 space-y-2" : "space-y-2"}>
                {field.type !== "checkbox" && (
                  <Label>
                    {field.name} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                )}
                <Controller
                  control={form.control}
                  name={`customFields.${field.id}` as any}
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
          <Label>Active Status</Label>
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

      <div className="flex justify-end space-x-4 pt-4">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

export interface ProductFormProps {
  initialData?: ApiProduct;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, settingsData] = await Promise.all([
          CategoryService.getCategories(),
          SettingsService.getSettings()
        ]);
        
        setCategories(catData);
        setCustomFields(settingsData.customFieldDefinitions?.products || []);
      } catch (err) {
        console.error("Failed to load form data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <ProductFormInner initialData={initialData} categories={categories} customFields={customFields} />;
}
