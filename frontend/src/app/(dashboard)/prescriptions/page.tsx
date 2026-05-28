import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PrescriptionTable } from "@/components/prescriptions/PrescriptionTable";
import { MOCK_PRESCRIPTIONS } from "@/lib/mock-prescription-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function PrescriptionListPage() {
  return (
    <PageContainer title="Prescriptions" description="Manage patient optical prescriptions and historical records.">
      <ProductHeader 
        title="All Prescriptions" 
        action={{ label: "New Prescription", href: "/prescriptions/new" }} 
      />
      
      <PrescriptionTable data={MOCK_PRESCRIPTIONS} />
    </PageContainer>
  );
}
