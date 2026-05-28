import { PageContainer } from "@/components/layout/PageContainer";
import { ProductForm } from "@/components/products/ProductForm";

export default function CreateProductPage() {
  return (
    <PageContainer title="Products" description="Add a new product to your catalog.">
      <ProductForm />
    </PageContainer>
  );
}
