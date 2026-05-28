"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductForm } from "@/components/products/ProductForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFetch } from "@/hooks/useApi";
import { ApiProduct } from "@/services/product.service";
import { Loader2 } from "lucide-react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const { data: response, isLoading, error } = useFetch<{ success: boolean, data: ApiProduct }>(`/products/${resolvedParams.id}`);

  if (isLoading) {
    return (
      <PageContainer title="Products" description="Update product details.">
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
        <EmptyState title="Product Not Found" description="The product you are trying to edit does not exist or could not be loaded." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="">
      <ProductForm initialData={product} />
    </PageContainer>
  );
}
