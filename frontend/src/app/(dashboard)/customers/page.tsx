import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader"; // Reusing the header component layout
import { CustomerTable } from "@/components/customers/CustomerTable";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";

export default function CustomersPage() {
  return (
    <PageContainer title="Customers" description="Manage your customer relationships and history.">
      <ProductHeader 
        title="All Customers" 
        action={{ label: "Add Customer", href: "/customers/new" }} 
      />
      <CustomerTable data={MOCK_CUSTOMERS} />
    </PageContainer>
  );
}
