"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const adjustmentSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  type: z.enum(["PURCHASE", "RETURN", "ADJUSTMENT"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  action: z.enum(["ADD", "REMOVE"]),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

type AdjustmentValues = z.infer<typeof adjustmentSchema>;

export function StockAdjustmentForm() {
  const router = useRouter();
  
  const form = useForm<AdjustmentValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      productId: "",
      type: "ADJUSTMENT",
      quantity: 1,
      action: "ADD",
      referenceId: "",
      notes: "",
    },
  });

  const watchProductId = form.watch("productId");
  const watchQuantity = form.watch("quantity");
  const watchAction = form.watch("action");
  
  const selectedProduct = MOCK_PRODUCTS.find(p => p.id === watchProductId);
  
  // Calculate projected stock purely for UI feedback
  const currentStock = selectedProduct?.currentStock || 0;
  const projectedStock = watchAction === "ADD" 
    ? currentStock + (watchQuantity || 0) 
    : currentStock - (watchQuantity || 0);

  const onSubmit = (values: AdjustmentValues) => {
    // In a real app, this would be an API call
    console.log("Mock Stock Adjustment:", values);
    
    // Simulate API success and redirect
    router.push("/inventory/ledger");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card rounded-lg border border-border shadow-sm p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Product <span className="text-destructive">*</span></label>
            <Controller
              control={form.control}
              name="productId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={form.formState.errors.productId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PRODUCTS.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.productId && <p className="text-xs text-destructive">{form.formState.errors.productId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE">Purchase (Stock In)</SelectItem>
                      <SelectItem value="RETURN">Return (Stock In/Out)</SelectItem>
                      <SelectItem value="ADJUSTMENT">Manual Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Controller
                control={form.control}
                name="action"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADD">Add to Stock (+)</SelectItem>
                      <SelectItem value="REMOVE">Remove from Stock (-)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity <span className="text-destructive">*</span></label>
              <Input 
                type="number" 
                min="1"
                {...form.register("quantity", { valueAsNumber: true })}
                className={form.formState.errors.quantity ? "border-destructive" : ""}
              />
              {form.formState.errors.quantity && <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reference ID (Optional)</label>
              <Input 
                placeholder="e.g. PO-1234, INV-999"
                {...form.register("referenceId")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason / Notes</label>
            <Textarea 
              placeholder="Explain the reason for this adjustment..."
              className="resize-none h-24"
              {...form.register("notes")}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Confirm Adjustment</Button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Summary Card */}
      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4 sticky top-6">
          <h3 className="font-medium text-foreground border-b border-border pb-2">Adjustment Summary</h3>
          
          {!selectedProduct ? (
            <p className="text-sm text-muted-foreground text-center py-8">Select a product to see stock projections.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium truncate max-w-[150px]" title={selectedProduct.name}>{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current Stock</span>
                <span className="font-medium">{currentStock}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Adjustment</span>
                <span className={`font-medium ${watchAction === "ADD" ? "text-green-600" : "text-destructive"}`}>
                  {watchAction === "ADD" ? "+" : "-"}{watchQuantity || 0}
                </span>
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Projected Stock</span>
                  <span className="font-bold text-xl">{projectedStock}</span>
                </div>
              </div>
              {projectedStock < 0 && (
                <div className="bg-red-50 text-red-800 text-xs p-3 rounded-md border border-red-200 mt-4">
                  Warning: This adjustment will result in negative stock. Ensure this is intentional.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
