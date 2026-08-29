import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { SectionCard } from "@/components/dashboard/SectionCard";

export default function NewCategoryPage() {
  return (
    <PageContainer title="Categories" description="Add a new category to organize your products.">
      <ProductHeader title="Create Category" />
      <SectionCard className="max-w-4xl mx-auto">
        <CategoryForm />
      </SectionCard>
    </PageContainer>
  );
}
