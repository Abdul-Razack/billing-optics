"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryTable } from "@/components/categories/CategoryTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/useApi";
import { CategoryService, ApiCategory } from "@/services/category.service";

export default function CategoriesPage() {
  const { data: response, isLoading, refetch } = useFetch<{ success: boolean, data: ApiCategory[] }>("/categories");
  const categories = response?.data || [];

  const handleDelete = async (id: number) => {
    try {
      await CategoryService.deleteCategory(id);
      refetch();
    } catch (error) {
      console.error("Failed to delete category", error);
      alert("Failed to delete category. It may be in use.");
    }
  };

  return (
    <PageContainer title="Categories" description="Manage product categories.">
      <ProductHeader title="Categories">
        <Button asChild>
          <Link href="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </ProductHeader>

      <ProductCard title="All Categories">
        <CategoryTable 
          data={categories} 
          isLoading={isLoading} 
          onDelete={handleDelete}
        />
      </ProductCard>
    </PageContainer>
  );
}
