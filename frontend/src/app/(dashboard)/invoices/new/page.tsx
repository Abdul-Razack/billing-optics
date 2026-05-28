import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default function CreateInvoicePage() {
  return (
    <PageContainer title="Billing & POS" description="Create a new invoice and process payment.">
      <ProductHeader title="New Sale" />
      <InvoiceForm />
    </PageContainer>
  );
}
