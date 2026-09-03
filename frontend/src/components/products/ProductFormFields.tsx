"use client";

import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategorySelector } from "./CategorySelector";
import { ApiCategory } from "@/services/category.service";
import { 
  Sparkles, 
  Barcode, 
  Wand2, 
  IndianRupee, 
  TrendingUp, 
  Boxes, 
  ReceiptText,
  AlertCircle
} from "lucide-react";

interface ProductFormFieldsProps {
  categories: ApiCategory[];
  isEditMode?: boolean;
  children?: React.ReactNode;
}

const TAX_RULES = [
  { value: 18, label: "18% GST (Frames & Sunglasses)" },
  { value: 12, label: "12% GST (Lenses & Contact Lenses)" },
  { value: 5, label: "5% GST (Medical / Clinical)" },
  { value: 0, label: "0% GST (Exempt / Non-Taxable)" },
];

export function ProductFormFields({ categories, isEditMode = false, children }: ProductFormFieldsProps) {
  const { register, control, setValue, formState: { errors } } = useFormContext();
  
  const categoryId = useWatch({ control, name: "categoryId" });
  const costPrice = useWatch({ control, name: "costPrice" }) || 0;
  const mrp = useWatch({ control, name: "mrp" });
  const sellingPrice = useWatch({ control, name: "sellingPrice" }) || 0;
  const initialStock = useWatch({ control, name: "initialStock" }) || 0;
  const gstPercent = useWatch({ control, name: "gstPercent" }) ?? 18;

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isLensCategory = selectedCategory?.name?.toLowerCase().includes("lens");

  // Calculations for live commercial preview
  const totalInvestment = costPrice * initialStock;
  const profitPerUnit = sellingPrice - costPrice;
  const marginPercent = costPrice > 0 ? ((profitPerUnit / costPrice) * 100).toFixed(1) : "0.0";
  const mrpDiscount = mrp && mrp > sellingPrice ? mrp - sellingPrice : 0;

  // Auto-generate barcode helper
  const handleGenerateBarcode = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 900 + 100);
    const code = `OPT-${timestamp}${random}`;
    setValue("barcode", code, { shouldDirty: true });
    if (!useWatch({ control, name: "sku" })) {
      setValue("sku", code, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Reference Notice Banner */}
      <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs sm:text-sm font-medium">
        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>Select product category to show respective optical parameters & inventory details.</span>
      </div>

      {/* 2. Category & Master Setup Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/15">
          <CardTitle className="text-base sm:text-lg flex items-center justify-between">
            <span>Product Classification & Identification</span>
            {selectedCategory && (
              <Badge variant="secondary" className="font-normal text-xs">
                Active Category: {selectedCategory.name}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            Choose optical category and define the primary product identifiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* Category Pill / Combobox Selector */}
          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-xs sm:text-sm font-semibold flex items-center gap-1">
              <span>Optical Category / Product Type</span>
              <span className="text-destructive">*</span>
            </Label>
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

          {/* Product Name / Title */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs sm:text-sm font-medium flex items-center gap-1">
              <span>Product Display Name / Model Title</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="name" 
              {...register("name")} 
              placeholder="e.g. Ray-Ban Aviator RB3025 Gold or Essilor Crizal 1.67 Blue-Cut" 
              className="h-10 text-sm font-medium"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
          </div>

          {/* Identification Bar: SKU, Barcode, Tax Rule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {/* Barcode with Auto-Gen button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="barcode" className="text-xs font-medium">Barcode / Optical SKU</Label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Auto-Gen</span>
                </button>
              </div>
              <div className="relative">
                <Input 
                  id="barcode" 
                  {...register("barcode")} 
                  placeholder="Scan or enter barcode" 
                  className="h-9 text-xs sm:text-sm font-mono"
                />
                <Barcode className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
              </div>
              {errors.barcode && <p className="text-xs text-destructive">{errors.barcode.message as string}</p>}
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs font-medium">Internal SKU / Code</Label>
              <Input 
                id="sku" 
                {...register("sku")} 
                placeholder="Auto-assigned if empty" 
                className="h-9 text-xs sm:text-sm font-mono"
              />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message as string}</p>}
            </div>

            {/* Tax Rule / GST */}
            <div className="space-y-1.5">
              <Label htmlFor="gstPercent" className="text-xs font-medium">Tax Rule (GST %)</Label>
              <Controller
                control={control}
                name="gstPercent"
                render={({ field }) => (
                  <Select 
                    value={String(field.value ?? 18)} 
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Select Tax Rule" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_RULES.map((rule) => (
                        <SelectItem key={rule.value} value={String(rule.value)}>
                          {rule.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gstPercent && <p className="text-xs text-destructive">{errors.gstPercent.message as string}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optical Category Parameters (Rendered when category is active) */}
      {children}

      {/* 3. Pricing, Quantities & Commercials Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/15">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span>Pricing, Stock & Commercial Parameters</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Enter purchase cost, retail pricing, and opening stock level.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Initial Stock */}
            <div className="space-y-1.5">
              <Label htmlFor="initialStock" className="text-xs font-semibold flex items-center justify-between">
                <span>Opening Quantity</span>
                {isLensCategory && (
                  <span className="text-[10px] text-muted-foreground font-normal">Pcs or Pairs</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="initialStock"
                  type="number"
                  min="0"
                  disabled={isEditMode}
                  {...register("initialStock", { valueAsNumber: true })}
                  placeholder="0"
                  className="h-9 text-sm font-semibold"
                />
                <Boxes className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
              </div>
              <p className="text-[11px] text-muted-foreground">Initial inventory stock count</p>
              {errors.initialStock && <p className="text-xs text-destructive">{errors.initialStock.message as string}</p>}
            </div>

            {/* Cost Price */}
            <div className="space-y-1.5">
              <Label htmlFor="costPrice" className="text-xs font-semibold flex items-center justify-between">
                <span>Purchase Price (Cost)</span>
                <span className="text-muted-foreground font-normal text-[11px]">Excl. Tax</span>
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-medium">₹</span>
                <Input 
                  id="costPrice" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  {...register("costPrice", { valueAsNumber: true })} 
                  className="h-9 pl-6 text-sm font-semibold"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Vendor purchase rate</p>
              {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice.message as string}</p>}
            </div>

            {/* MRP */}
            <div className="space-y-1.5">
              <Label htmlFor="mrp" className="text-xs font-semibold flex items-center justify-between">
                <span>Retail Price (MRP)</span>
                <span className="text-[10px] text-muted-foreground font-normal border rounded px-1">Optional</span>
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground font-medium">₹</span>
                <Input 
                  id="mrp" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="Max Retail Price"
                  {...register("mrp", { valueAsNumber: true })} 
                  className="h-9 pl-6 text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Printed tag / list price</p>
              {errors.mrp && <p className="text-xs text-destructive">{errors.mrp.message as string}</p>}
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice" className="text-xs font-semibold flex items-center justify-between text-primary">
                <span>Selling / Billing Price *</span>
                <span className="text-[10px] text-primary font-medium">POS Rate</span>
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-xs text-primary font-medium">₹</span>
                <Input 
                  id="sellingPrice" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  {...register("sellingPrice", { valueAsNumber: true })} 
                  className="h-9 pl-6 text-sm font-bold border-primary/50 focus-visible:ring-primary"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Final discounted customer rate</p>
              {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice.message as string}</p>}
            </div>
          </div>

          {/* Row 2: Min Stock Alert */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-border/40">
            <div className="space-y-1.5">
              <Label htmlFor="minStockAlert" className="text-xs font-medium">Min Stock Alert Level</Label>
              <Input 
                id="minStockAlert" 
                type="number" 
                min="0"
                {...register("minStockAlert", { valueAsNumber: true })} 
                className="h-9 text-xs sm:text-sm"
              />
              <p className="text-[11px] text-muted-foreground">Notify when stock falls below this</p>
              {errors.minStockAlert && <p className="text-xs text-destructive">{errors.minStockAlert.message as string}</p>}
            </div>
          </div>

          {/* Real-time Commercial Preview Summary Box */}
          <div className="rounded-lg bg-muted/40 border border-border/80 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Commercial Summary Preview
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] text-muted-foreground block">Total Stock Investment</span>
                <span className="text-sm sm:text-base font-bold text-foreground">
                  ₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Gross Margin / Unit</span>
                <span className={`text-sm sm:text-base font-bold ${profitPerUnit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                  {profitPerUnit >= 0 ? "+" : ""}₹{profitPerUnit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Markup %</span>
                <span className="text-sm sm:text-base font-bold text-foreground">
                  {marginPercent}%
                </span>
              </div>
              {mrpDiscount > 0 && (
                <div>
                  <span className="text-[11px] text-muted-foreground block">Customer Savings (MRP)</span>
                  <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                    ₹{mrpDiscount.toFixed(2)} off
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Invoice Description & Settings */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/15">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-primary" />
            <span>Bill Line Item Description & Settings</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Optional custom text to print on customer receipts and store catalog status.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs sm:text-sm font-medium">Invoice Line Description</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              placeholder="e.g. Anti-reflective coated single vision distance lenses (Pair)"
              className="min-h-[70px] text-xs sm:text-sm" 
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message as string}</p>}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Active in POS Register</Label>
              <p className="text-xs text-muted-foreground">Enabled products appear for billing, barcode search, and inventory scans.</p>
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
