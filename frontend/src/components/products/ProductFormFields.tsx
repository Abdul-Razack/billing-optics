"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CategorySelector } from "./CategorySelector";
import { ApiCategory } from "@/services/category.service";

interface ProductFormFieldsProps {
  categories: ApiCategory[];
}

export function ProductFormFields({ categories }: ProductFormFieldsProps) {
  const { register, control, formState: { errors } } = useFormContext();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Label htmlFor="minStockAlert">Stock Quantity</Label>
              <Input 
                id="minStockAlert" 
                type="NUMBER" 
                min="0"
                {...register("minStockAlert", { valueAsNumber: true })} 
              />
              <p className="text-[10px] text-muted-foreground">Used as min alert/initial stock</p>
              {errors.minStockAlert && <p className="text-xs text-destructive">{errors.minStockAlert.message as string}</p>}
            </div>
          </div>
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
