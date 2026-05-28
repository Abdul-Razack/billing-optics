"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductForm } from "@/components/products/ProductForm";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { EmptyState } from "@/components/shared/EmptyState";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const product = MOCK_PRODUCTS.find(p => p.id === resolvedParams.id);

  if (!product) {
    return (
      <PageContainer title="Products">
        <EmptyState title="Product Not Found" description="The product you are trying to edit does not exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Products" description="Update product details.">
      <ProductHeader title={`Edit ${product.name}`} />
      <SectionCard className="max-w-4xl mx-auto">
        <ProductForm initialData={product} />
      </SectionCard>
    </PageContainer>
  );
}
