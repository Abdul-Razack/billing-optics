import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductForm } from "@/components/products/ProductForm";
import { SectionCard } from "@/components/dashboard/SectionCard";

export default function CreateProductPage() {
  return (
    <PageContainer title="Products" description="Add a new product to your catalog.">
      <ProductHeader title="Create Product" />
      <SectionCard className="max-w-4xl mx-auto">
        <ProductForm />
      </SectionCard>
    </PageContainer>
  );
}
