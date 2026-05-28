import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RecordPaymentPage() {
  return (
    <PageContainer title="Record Payment" description="Log a new payment received against an invoice.">
      <ProductHeader title="New Payment">
        <Button variant="outline" asChild>
          <Link href="/payments">Cancel</Link>
        </Button>
      </ProductHeader>
      
      <PaymentForm />
    </PageContainer>
  );
}
