import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";
import { MOCK_PRESCRIPTIONS } from "@/lib/mock-prescription-data";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditPrescriptionPage({ params }: { params: { id: string } }) {
  const prescription = MOCK_PRESCRIPTIONS.find(p => p.id === params.id);

  if (!prescription) {
    notFound();
  }

  return (
    <PageContainer title="Edit Prescription" description={`Modifying Rx ${prescription.id.toUpperCase()}`}>
      <ProductHeader title="Edit Prescription">
        <Button variant="outline" asChild>
          <Link href={`/prescriptions/${prescription.id}`}>Back to Details</Link>
        </Button>
      </ProductHeader>
      
      <PrescriptionForm initialData={prescription} />
    </PageContainer>
  );
}
