import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PaymentTable } from "@/components/payments/PaymentTable";
import { MOCK_PAYMENTS } from "@/lib/mock-payment-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function PaymentListPage() {
  return (
    <PageContainer title="Payments" description="Manage incoming payments and transaction history.">
      <ProductHeader 
        title="Payment Records" 
        action={{ label: "Record Payment", href: "/payments/new" }}
      >
        <Button variant="outline" asChild className="mr-2">
          <Link href="/payments/pending">
            <Clock className="mr-2 h-4 w-4 text-orange-500" />
            Pending Dues
          </Link>
        </Button>
      </ProductHeader>
      
      <PaymentTable data={MOCK_PAYMENTS} />
    </PageContainer>
  );
}
