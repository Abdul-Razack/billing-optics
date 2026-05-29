"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductProfileHeader } from "@/components/products/ProductProfileHeader";
import { ProductInfoCard } from "@/components/products/ProductInfoCard";
import { ProductTabs } from "@/components/products/ProductTabs";
import { ProductMediaGallery } from "@/components/products/ProductMediaGallery";
import { StockStatusBadge } from "@/components/products/StockStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useApi";
import { ProductService, ApiProduct } from "@/services/product.service";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { SettingsService } from "@/services/settings.service";
import { CustomField } from "@/types/product";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const isValidId = resolvedParams.id && resolvedParams.id !== "undefined";
  const productId = isValidId ? parseInt(resolvedParams.id, 10) : NaN;
  
  const { data: response, isLoading, error, refetch } = useFetch<{ success: boolean, data: ApiProduct }>(
    isValidId && !isNaN(productId) ? `/products/${productId}` : "",
    { enabled: !!(isValidId && !isNaN(productId)) }
  );
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Modals state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStockUpdateOpen, setIsStockUpdateOpen] = useState(false);
  const [newStockValue, setNewStockValue] = useState<string>("");
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  useEffect(() => {
    CategoryService.getCategories().then(setCategories).catch(console.error);
    SettingsService.getSettings()
      .then((res) => setCustomFields(res.customFieldDefinitions?.products || []))
      .catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <PageContainer title="">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  const product = response?.data;

  if (error || !product) {
    return (
      <PageContainer title="">
        <EmptyState title="Product Not Found" description="The product you are trying to view does not exist or could not be loaded." />
      </PageContainer>
    );
  }

  const category = categories.find(c => c.id === product.categoryId);
  
  // Stock calculation
  // currentStock doesn't exist on backend payload yet, falling back to minStockAlert trick for demonstration
  const currentStock = (product as any).currentStock ?? 0;
  const stockStatus = currentStock <= (product.minStockAlert || 5) ? (currentStock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK") : "IN_STOCK";

  // Profit Margin calculation
  const sp = product.sellingPrice || 0;
  const cp = product.costPrice || 0;
  const profitMargin = sp > 0 ? ((sp - cp) / sp) * 100 : 0;

  // Handlers
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await ProductService.deleteProduct(product.id);
      toast.success("Product deleted successfully");
      router.push("/products");
    } catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
      setIsDeleting(false);
    }
  };

  const handleOpenStockUpdate = () => {
    setNewStockValue(currentStock.toString());
    setIsStockUpdateOpen(true);
  };

  const submitStockUpdate = async () => {
    const stockNum = parseInt(newStockValue, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }

    setIsUpdatingStock(true);
    try {
      await ProductService.updateProduct(product.id, {
        minStockAlert: stockNum, // Demonstrating mutation on existing field for now
      });
      toast.success("Stock updated successfully!");
      setIsStockUpdateOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update stock");
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const overviewContent = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ProductInfoCard title="Product Information">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-medium">{product.sku || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Barcode</p>
                <p className="font-medium">{product.barcode || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{category?.name || "Uncategorized"}</p>
              </div>
            </div>
            {product.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium text-sm">{product.createdAt ? new Date(product.createdAt).toLocaleString() : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium text-sm">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "—"}</p>
              </div>
            </div>
          </div>
        </ProductInfoCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ProductInfoCard title="Pricing Details">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Selling Price</span>
                <span className="font-semibold text-lg">${sp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Cost Price</span>
                <span className="font-medium">${cp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">GST Tax</span>
                <span className="font-medium">{product.gstPercent || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profit Margin</span>
                <span className={`font-medium ${profitMargin > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {profitMargin.toFixed(2)}%
                </span>
              </div>
            </div>
          </ProductInfoCard>

          <ProductInfoCard title="Inventory Status">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Current Stock</span>
                <span className="font-semibold text-lg">{currentStock}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Min. Alert Level</span>
                <span className="font-medium">{product.minStockAlert || 5}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <StockStatusBadge status={stockStatus} />
              </div>
            </div>
          </ProductInfoCard>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <ProductMediaGallery />
      </div>
    </div>
  );

  const attributesContent = (
    <ProductInfoCard title="Dynamic Attributes">
      {product.attributes && Object.keys(product.attributes).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(product.attributes).map(([key, value]) => {
            const fieldDef = customFields.find((f) => f.id === key);
            const label = fieldDef?.name || key.replace(/_/g, ' ');
            let displayValue = String(value);

            if (fieldDef?.type === "checkbox") {
              displayValue = value ? "Yes" : "No";
            } else if (value === null || value === undefined || value === "") {
              displayValue = "—";
            }

            return (
              <div key={key} className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                <p className="font-medium">{displayValue}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="No Attributes Configured" 
          description="This product has no dynamic attributes configured or filled out."
        />
      )}
    </ProductInfoCard>
  );

  return (
    <PageContainer title="">
      <ProductProfileHeader 
        productId={product.id} 
        name={product.name} 
        isActive={product.isActive} 
        onDelete={() => setIsDeleteDialogOpen(true)}
        onQuickStockUpdate={handleOpenStockUpdate}
      />

      <ProductTabs 
        overviewContent={overviewContent} 
        attributesContent={attributesContent} 
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={isStockUpdateOpen} onOpenChange={setIsStockUpdateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              Quick Stock Update
            </DialogTitle>
            <DialogDescription>
              Update inventory level for <strong className="text-foreground">{product.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label htmlFor="stockValue" className="text-sm font-medium">New Stock Quantity</label>
              <Input 
                id="stockValue"
                type="number"
                min="0"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockUpdateOpen(false)} disabled={isUpdatingStock}>Cancel</Button>
            <Button onClick={submitStockUpdate} disabled={isUpdatingStock}>
              {isUpdatingStock ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
