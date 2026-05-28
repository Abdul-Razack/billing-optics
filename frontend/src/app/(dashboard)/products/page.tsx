import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductTable } from "@/components/products/ProductTable";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export default function ProductsPage() {
  return (
    <PageContainer title="Products" description="Manage your product inventory and catalog.">
      <ProductHeader 
        title="All Products" 
        action={{ label: "Add Product", href: "/products/new" }} 
      />
      <ProductTable data={MOCK_PRODUCTS} />
    </PageContainer>
  );
}
