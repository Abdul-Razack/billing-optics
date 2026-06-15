"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CategoryService, ApiCategory } from "@/services/category.service";
import { ProductService, ApiProduct } from "@/services/product.service";
import { SettingsService } from "@/services/settings.service";
import { InventoryService } from "@/services/inventory.service";
import { CustomField } from "@/types/custom-field";
import { buildDynamicSchema } from "@/lib/dynamic-schema";

import { ProductFormFields } from "./ProductFormFields";
import { ProductCustomFields } from "./ProductCustomFields";
import { ProductImageUploader } from "./ProductImageUploader";
import { ProductFormActions } from "./ProductFormActions";
import { ProductUpdateActions } from "./ProductUpdateActions";
import { ProductEditHeader } from "./ProductEditHeader";
import { UnsavedChangesGuard } from "./UnsavedChangesGuard";

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
  initialStock: z.number().min(0).default(0),
  isActive: z.boolean(),
  customFields: z.record(z.any()).optional(),
});

interface ProductFormInnerProps {
  initialData?: ApiProduct;
  categories: ApiCategory[];
  customFields: CustomField[];
}

function ProductFormInner({ initialData, categories, customFields }: ProductFormInnerProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we should reset or redirect after save
  const nextActionRef = useRef<"redirect" | "reset">("redirect");

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
      initialStock: 0,
      isActive: initialData?.isActive ?? true,
      customFields: initialData?.attributes || {},
    },
  });

  const { formState: { isDirty } } = form;

  const onSubmit = async (values: DynamicProductValues) => {
    setIsSaving(true);
    setError(null);
    try {
      const { initialStock, customFields: cf, ...rest } = values as any;
      const payload = {
        ...rest,
        attributes: (cf || {}) as Record<string, any>,
      };

      if (isEditMode && initialData) {
        await ProductService.updateProduct(initialData.id, payload);
        toast.success("Product updated successfully");
      } else {
        const created = await ProductService.createProduct(payload);
        // If an initial stock quantity was provided, create an inventory ledger entry
        if (initialStock && initialStock > 0) {
          try {
            await InventoryService.adjustStock({
              productId: created.id,
              adjustmentType: "IN",
              quantity: initialStock,
              notes: "Initial stock on product creation",
            });
          } catch (stockErr) {
            console.error("Failed to set initial stock:", stockErr);
            // Don't block the product creation — just warn
            toast.warning("Product created, but initial stock could not be set. You can adjust it from the product page.");
          }
        }
        toast.success("Product created successfully");
      }
      
      if (nextActionRef.current === "reset") {
        form.reset();
        nextActionRef.current = "redirect";
      } else {
        router.push("/products");
        router.refresh(); 
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An error occurred while saving.";
      setError(errMsg);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndAddAnother = useCallback(() => {
    nextActionRef.current = "reset";
    form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  const handleFormSubmit = useCallback(
    (e?: React.BaseSyntheticEvent) => {
      return form.handleSubmit(onSubmit)(e);
    },
    [form, onSubmit]
  );

  return (
    <div className="max-w-5xl mx-auto">
      {isEditMode && initialData && (
        <ProductEditHeader title={initialData.name} isDirty={isDirty} />
      )}
      
      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 font-medium">
          {error}
        </div>
      )}

      <FormProvider {...form}>
        <UnsavedChangesGuard isDirty={isDirty} />
        <form onSubmit={handleFormSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Form Area */}
            <div className="xl:col-span-2 space-y-8">
              <ProductFormFields categories={categories} isEditMode={isEditMode} />
              
              {customFields.length > 0 && (
                <ProductCustomFields customFields={customFields} />
              )}
            </div>

            {/* Sidebar Area */}
            <div className="xl:col-span-1 space-y-8">
              <ProductImageUploader maxImages={5} />
            </div>
          </div>

          {isEditMode ? (
            <ProductUpdateActions isSaving={isSaving} isDirty={isDirty} />
          ) : (
            <ProductFormActions 
              isEditMode={false} 
              isSaving={isSaving} 
              onSaveAndAddAnother={handleSaveAndAddAnother} 
            />
          )}
        </form>
      </FormProvider>
    </div>
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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <ProductFormInner initialData={initialData} categories={categories} customFields={customFields} />;
}
