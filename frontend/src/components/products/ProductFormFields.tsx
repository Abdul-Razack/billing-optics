"use client";

import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySelector } from "./CategorySelector";
import { ApiCategory } from "@/services/category.service";

const PRODUCT_TYPES = [
  { value: "FRAME", label: "Frame" },
  { value: "LENS", label: "Lens (Glass)" },
  { value: "CONTACT_LENS", label: "Contact Lens" },
  { value: "SUNGLASSES", label: "Sunglasses" },
  { value: "SOLUTION", label: "Solution / Accessories" },
  { value: "OTHER", label: "Other" },
];

interface ProductFormFieldsProps {
  categories: ApiCategory[];
  isEditMode?: boolean;
}

export function ProductFormFields({ categories, isEditMode = false }: ProductFormFieldsProps) {
  const { register, control, formState: { errors } } = useFormContext();
  const productType = useWatch({ control, name: "productType" }) || "OTHER";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register("name")} placeholder="Enter product name" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category <span className="text-destructive">*</span></Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <CategorySelector 
                    categories={categories} 
                    value={field.value} 
                    onValueChange={field.onChange}
                    error={!!errors.categoryId}
                  />
                )}
              />
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
              <Input id="sku" {...register("sku")} placeholder="Leave blank to auto-generate" />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" {...register("barcode")} placeholder="Scan or enter barcode" />
              {errors.barcode && <p className="text-xs text-destructive">{errors.barcode.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              placeholder="Enter product description"
              className="min-h-[120px]" 
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message as string}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input 
                id="costPrice" 
                type="NUMBER" 
                step="0.01" 
                min="0"
                {...register("costPrice", { valueAsNumber: true })} 
              />
              {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrp" className="flex items-center gap-1.5">
                MRP <span className="text-[10px] text-muted-foreground font-normal border rounded px-1">optional</span>
              </Label>
              <Input 
                id="mrp" 
                type="NUMBER" 
                step="0.01" 
                min="0"
                placeholder="Retail / list price"
                {...register("mrp", { valueAsNumber: true })} 
              />
              <p className="text-[10px] text-muted-foreground">Show &quot;MRP ₹X, Selling ₹Y&quot;</p>
              {errors.mrp && <p className="text-xs text-destructive">{errors.mrp.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price <span className="text-destructive">*</span></Label>
              <Input 
                id="sellingPrice" 
                type="NUMBER" 
                step="0.01" 
                min="0"
                {...register("sellingPrice", { valueAsNumber: true })} 
              />
              {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstPercent">GST (%)</Label>
              <Input 
                id="gstPercent" 
                type="NUMBER" 
                min="0"
                max="100"
                {...register("gstPercent", { valueAsNumber: true })} 
              />
              {errors.gstPercent && <p className="text-xs text-destructive">{errors.gstPercent.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStockAlert">Min Stock Alert</Label>
              <Input 
                id="minStockAlert" 
                type="NUMBER" 
                min="0"
                {...register("minStockAlert", { valueAsNumber: true })} 
              />
              <p className="text-[10px] text-muted-foreground">Alert when stock falls below this level</p>
              {errors.minStockAlert && <p className="text-xs text-destructive">{errors.minStockAlert.message as string}</p>}
            </div>
          </div>

          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="initialStock">Initial Stock Quantity</Label>
                <Input
                  id="initialStock"
                  type="NUMBER"
                  min="0"
                  {...register("initialStock", { valueAsNumber: true })}
                  placeholder="0"
                />
                <p className="text-[10px] text-muted-foreground">Opening stock added to inventory on save</p>
                {errors.initialStock && <p className="text-xs text-destructive">{errors.initialStock.message as string}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Type & Optical Attributes */}
      <Card>
        <CardHeader>
          <CardTitle>Optical Product Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Product Type</Label>
            <Controller
              control={control}
              name="productType"
              render={({ field }) => (
                <Select value={field.value || "OTHER"} onValueChange={field.onChange}>
                  <SelectTrigger id="productType">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Hardcoded optical fields have been removed in favor of dynamic category attributes */}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Active Status</Label>
              <p className="text-sm text-muted-foreground">Inactive products will not appear in the POS register.</p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
