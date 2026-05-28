"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductStatusBadge } from "@/components/products/ProductStatusBadge";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_CUSTOM_FIELDS } from "@/lib/mock-data";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTablePlaceholder } from "@/components/tables/DataTablePlaceholder";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const product = MOCK_PRODUCTS.find(p => p.id === resolvedParams.id);

  if (!product) {
    return (
      <PageContainer title="Products">
        <EmptyState title="Product Not Found" description="The product you are trying to view does not exist." />
      </PageContainer>
    );
  }

  const category = MOCK_CATEGORIES.find(c => c.id === product.categoryId);

  return (
    <PageContainer title="Products" description="View product details and history.">
      <ProductHeader title={product.name}>
        <Button asChild variant="outline">
          <Link href={`/products/${product.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </ProductHeader>

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
              </div>
            </ProductCard>

            <ProductCard title="Pricing & Stock">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Price</p>
                    <p className="font-medium">${product.costPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Selling Price</p>
                    <p className="font-medium">${product.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GST</p>
                    <p className="font-medium">{product.gstPercent}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{product.currentStock}</p>
                      <ProductStatusBadge type="stock" status={product.stockStatus} />
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
            {product.customFields && Object.keys(product.customFields).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.customFields).map(([key, value]) => {
                  const fieldDef = MOCK_CUSTOM_FIELDS.find(f => f.id === key);
                  return (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground">{fieldDef?.name || key}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attributes configured for this product.</p>
            )}
          </ProductCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
