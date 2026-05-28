import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader"; // Reusing the header layout
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { MOCK_INVOICES } from "@/lib/mock-invoice-data";

export default function InvoicesPage() {
  return (
    <PageContainer title="Invoices" description="Manage all your billing and invoices.">
      <ProductHeader 
        title="All Invoices" 
        action={{ label: "Create Invoice", href: "/invoices/new" }} 
      />
      <InvoiceTable data={MOCK_INVOICES} />
    </PageContainer>
  );
}
