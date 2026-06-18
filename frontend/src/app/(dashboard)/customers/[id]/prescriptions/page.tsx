"use client";

import { useEffect, useState, use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { CustomerPrescriptionCard } from "@/components/prescriptions/CustomerPrescriptionCard";
import { PrescriptionHistoryTimeline } from "@/components/prescriptions/PrescriptionHistoryTimeline";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CustomerService } from "@/services/customer.service";
import { PrescriptionService } from "@/services/prescription.service";
import { Customer } from "@/types/customer";
import { Prescription } from "@/types/prescription";
import { toast } from "sonner";

export default function CustomerPrescriptionsHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const hasValidId = !!(resolvedParams.id && resolvedParams.id !== "undefined");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(hasValidId);

  useEffect(() => {
    if (!resolvedParams.id || resolvedParams.id === "undefined") {
      return;
    }

    async function loadData() {
      try {
        const cust = await CustomerService.getCustomerById(Number(resolvedParams.id));
        setCustomer(cust);
        
        const history = await PrescriptionService.getPrescriptionsByCustomerId(resolvedParams.id);
        setCustomerHistory(history);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load customer prescriptions");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  if (loading) {
    return <PageContainer title="Loading..."><div className="p-8">Loading...</div></PageContainer>;
  }

  if (!customer) {
    return <PageContainer title="Not Found"><div className="p-8">Customer not found.</div></PageContainer>;
  }

  const latestPrescription = customerHistory[0];

  return (
    <PageContainer title="Patient History" description={`Optical records for ${customer.fullName}`}>
      <ProductHeader 
        title="Prescription History"
        action={{ label: "New Prescription", href: "/prescriptions/new" }}
      >
        <Button variant="outline" asChild className="mr-2">
          <Link href={`/customers/${customer.id}`}>Back to Profile</Link>
        </Button>
      </ProductHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <CustomerPrescriptionCard customer={customer} latestPrescription={latestPrescription} />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-6">Historical Timeline</h3>
            <PrescriptionHistoryTimeline prescriptions={customerHistory} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
