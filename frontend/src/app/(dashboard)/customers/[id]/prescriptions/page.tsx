import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { CustomerPrescriptionCard } from "@/components/prescriptions/CustomerPrescriptionCard";
import { PrescriptionHistoryTimeline } from "@/components/prescriptions/PrescriptionHistoryTimeline";
import { MOCK_PRESCRIPTIONS } from "@/lib/mock-prescription-data";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function CustomerPrescriptionsHistoryPage({ params }: { params: { id: string } }) {
  const customer = MOCK_CUSTOMERS.find(c => c.id === params.id);
  
  if (!customer) {
    notFound();
  }

  // Find all prescriptions for this customer
  const customerHistory = MOCK_PRESCRIPTIONS.filter(p => p.customerId === customer.id);
  const activePrescription = customerHistory.find(p => p.isActive) || customerHistory[0];

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
          <CustomerPrescriptionCard customer={customer} latestPrescription={activePrescription} />
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
