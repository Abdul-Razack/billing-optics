"use client";

import { use, useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductStatusBadge } from "@/components/products/ProductStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTablePlaceholder } from "@/components/tables/DataTablePlaceholder";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Loader2, ArrowLeft } from "lucide-react";
import { useFetch } from "@/hooks/useApi";
import { ApiProduct } from "@/services/product.service";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { CustomField } from "@/types/product";
import { SettingsService } from "@/services/settings.service";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const { data: response, isLoading, error } = useFetch<{ success: boolean, data: ApiProduct }>(`/products/${resolvedParams.id}`);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    CategoryService.getCategories().then(setCategories).catch(console.error);
    SettingsService.getSettings()
      .then((res) => setCustomFields(res.customFieldDefinitions?.products || []))
      .catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <PageContainer title="Products" description="View product details and history.">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  const product = response?.data;

  if (error || !product) {
    return (
      <PageContainer title="Products">
        <EmptyState title="Product Not Found" description="The product you are trying to view does not exist or could not be loaded." />
      </PageContainer>
    );
  }

  const category = categories.find(c => c.id === product.categoryId);

  return (
    <PageContainer title="Products" description="View product details and history.">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <ProductHeader title={product.name} />
        </div>
        <Button asChild variant="outline">
          <Link href={`/products/${product.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory History</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProductCard title="Product Information">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-medium">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Barcode</p>
                    <p className="font-medium">{product.barcode || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{category?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <ProductStatusBadge type="active" isActive={product.isActive} />
                  </div>
                </div>
                {product.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{product.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Updated At</p>
                    <p className="font-medium">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            </ProductCard>

            <ProductCard title="Pricing & Stock">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Price</p>
                    <p className="font-medium">${(product.costPrice || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Selling Price</p>
                    <p className="font-medium">${(product.sellingPrice || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GST</p>
                    <p className="font-medium">{product.gstPercent || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Min Stock Alert</p>
                    <p className="font-medium">{product.minStockAlert || 0}</p>
                  </div>
                  <div className="col-span-2 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="font-medium text-lg">0</p>
                      <ProductStatusBadge type="stock" status={(0) <= (product.minStockAlert || 5) ? "LOW_STOCK" : "IN_STOCK"} />
                    </div>
                  </div>
                </div>
              </div>
            </ProductCard>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <ProductCard title="Inventory History" description="Recent stock adjustments and restocks.">
            <DataTablePlaceholder />
          </ProductCard>
        </TabsContent>

        <TabsContent value="sales">
          <ProductCard title="Sales History" description="Recent invoices containing this product.">
            <DataTablePlaceholder />
          </ProductCard>
        </TabsContent>

        <TabsContent value="attributes">
          <ProductCard title="Dynamic Attributes">
            {product.attributes && Object.keys(product.attributes).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div key={key}>
                      <p className="text-sm text-muted-foreground capitalize">{label}</p>
                      <p className="font-medium">{displayValue}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No dynamic attributes configured for this product.</p>
            )}
          </ProductCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
