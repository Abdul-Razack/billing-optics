"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PaymentTable } from "@/components/payments/PaymentTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock } from "lucide-react";
import { PaymentService, ApiPayment } from "@/services/payment.service";
import { toast } from "sonner";

export default function PaymentListPage() {
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const response = await PaymentService.getPayments({ limit: 100 });
        setPayments(response.data);
      } catch (error) {
        console.error("Failed to load payments:", error);
        toast.error("Failed to load payment records.");
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <PageContainer title="Payments" description="Manage incoming payments and transaction history.">
      <ProductHeader 
        title="Payment Records" 
        action={{ label: "Record Payment", href: "/invoices?paymentStatus=UNPAID" }}
      >
        <Button variant="outline" asChild className="mr-2">
          <Link href="/payments/pending">
            <Clock className="mr-2 h-4 w-4 text-orange-500" />
            Pending Dues
          </Link>
        </Button>
      </ProductHeader>
      
      {loading ? (
        <div className="flex justify-center p-8">Loading payments...</div>
      ) : (
        <PaymentTable data={payments as any} />
      )}
    </PageContainer>
  );
}
