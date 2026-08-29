"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { Loader2 } from "lucide-react";
import { use } from "react";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const categoryId = parseInt(resolvedParams.id, 10);
  const [category, setCategory] = useState<ApiCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await CategoryService.getCategory(categoryId);
        setCategory(data);
      } catch (err: any) {
        setError(err.message || "Failed to load category.");
      } finally {
        setIsLoading(false);
      }
    };
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  if (isLoading) {
    return (
      <PageContainer title="Edit Category" description="Loading category...">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (error || !category) {
    return (
      <PageContainer title="Edit Category" description="Error">
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          {error || "Category not found."}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Categories" description="Update category details.">
      <ProductHeader title="Edit Category" />
      <SectionCard className="max-w-4xl mx-auto">
        <CategoryForm initialData={category} />
      </SectionCard>
    </PageContainer>
  );
}
