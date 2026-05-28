import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreatePrescriptionPage() {
  return (
    <PageContainer title="New Prescription" description="Record a new optical prescription for a patient.">
      <ProductHeader title="Create Prescription">
        <Button variant="outline" asChild>
          <Link href="/prescriptions">Back to List</Link>
        </Button>
      </ProductHeader>
      
      <PrescriptionForm />
    </PageContainer>
  );
}
