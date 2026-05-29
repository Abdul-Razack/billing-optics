"use client";

import { useEffect, useState, use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PrescriptionService } from "@/services/prescription.service";
import { Prescription } from "@/types/prescription";
import { toast } from "sonner";

export default function EditPrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resolvedParams.id || resolvedParams.id === "undefined") {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const data = await PrescriptionService.getPrescriptionById(resolvedParams.id);
        setPrescription(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load prescription data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  if (loading) {
    return <PageContainer title="Loading..."><div className="p-8">Loading...</div></PageContainer>;
  }

  if (!prescription) {
    return <PageContainer title="Not Found"><div className="p-8">Prescription not found.</div></PageContainer>;
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
