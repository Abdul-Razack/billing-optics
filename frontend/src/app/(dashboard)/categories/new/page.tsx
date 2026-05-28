"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { CategoryForm } from "@/components/categories/CategoryForm";

export default function NewCategoryPage() {
  return (
    <PageContainer title="Create Category" description="Add a new category to organize your products.">
      <CategoryForm />
    </PageContainer>
  );
}
