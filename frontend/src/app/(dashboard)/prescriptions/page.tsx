"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { PrescriptionTable } from "@/components/prescriptions/PrescriptionTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PrescriptionService } from "@/services/prescription.service";
import { Prescription } from "@/types/prescription";
import { toast } from "sonner";

export default function PrescriptionListPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        const response = await PrescriptionService.getPrescriptions({ limit: 100 });
        setPrescriptions(response.data);
      } catch (error) {
        console.error("Failed to load prescriptions:", error);
        toast.error("Failed to load prescription records.");
      } finally {
        setLoading(false);
      }
    }
    loadPrescriptions();
  }, []);

  return (
    <PageContainer title="Prescriptions" description="Manage patient optical prescriptions and historical records.">
      <ProductHeader 
        title="All Prescriptions" 
        action={{ label: "New Prescription", href: "/prescriptions/new" }} 
      />
      
      {loading ? (
        <div className="flex justify-center p-8">Loading prescriptions...</div>
      ) : (
        <PrescriptionTable data={prescriptions} />
      )}
    </PageContainer>
  );
}
