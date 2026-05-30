"use client";

import { useEffect, useState, use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PrescriptionHeader } from "@/components/prescriptions/PrescriptionHeader";
import { CustomerPrescriptionCard } from "@/components/prescriptions/CustomerPrescriptionCard";
import { PrescriptionHistoryTimeline } from "@/components/prescriptions/PrescriptionHistoryTimeline";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { PrescriptionService } from "@/services/prescription.service";
import { Prescription } from "@/types/prescription";
import { toast } from "sonner";
import { CustomerService } from "@/services/customer.service";
import { Customer } from "@/types/customer";

export default function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const hasValidId = !!(resolvedParams.id && resolvedParams.id !== "undefined");
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(hasValidId);

  useEffect(() => {
    if (!resolvedParams.id || resolvedParams.id === "undefined") {
      return;
    }

    async function loadData() {
      try {
        const data = await PrescriptionService.getPrescriptionById(resolvedParams.id);
        setPrescription(data);
        
        if (data && data.customerId) {
          const cust = await CustomerService.getCustomerById(Number(data.customerId));
          setCustomer(cust);
          
          const history = await PrescriptionService.getPrescriptionsByCustomerId(data.customerId);
          setCustomerHistory(history);
        }
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
    <PageContainer title="Prescription Details" description={`Viewing Rx ${prescription.id.toUpperCase()}`}>
      <div className="mb-6">
        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/prescriptions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prescriptions
          </Link>
        </Button>
      </div>

      <PrescriptionHeader prescription={prescription} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patient">Patient Details</TabsTrigger>
          <TabsTrigger value="history">Patient History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-blue-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex justify-between items-center">
                <h3 className="font-semibold text-blue-900">Right Eye (OD)</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div><span className="text-sm text-muted-foreground block mb-1">Sphere (SPH)</span><span className="text-xl font-medium">{prescription.rightEye.sphere || "—"}</span></div>
                  <div><span className="text-sm text-muted-foreground block mb-1">Cylinder (CYL)</span><span className="text-xl font-medium">{prescription.rightEye.cylinder || "—"}</span></div>
                  <div><span className="text-sm text-muted-foreground block mb-1">Axis</span><span className="text-xl font-medium">{prescription.rightEye.axis || "—"}</span></div>
                  <div><span className="text-sm text-muted-foreground block mb-1">Add Power</span><span className="text-xl font-medium">{prescription.rightEye.addPower || "—"}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-green-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-green-50 border-b border-green-200 flex justify-between items-center">
                <h3 className="font-semibold text-green-900">Left Eye (OS)</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div><span className="text-sm text-muted-foreground block mb-1">Sphere (SPH)</span><span className="text-xl font-medium">{prescription.leftEye.sphere || "—"}</span></div>
                  <div><span className="text-sm text-muted-foreground block mb-1">Cylinder (CYL)</span><span className="text-xl font-medium">{prescription.leftEye.cylinder || "—"}</span></div>
                  <div><span className="text-sm text-muted-foreground block mb-1">Axis</span><span className="text-xl font-medium">{prescription.leftEye.axis || "—"}</span></div>
                  <div><span className="text-sm text-muted-foreground block mb-1">Add Power</span><span className="text-xl font-medium">{prescription.leftEye.addPower || "—"}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Pupillary Distance (PD)</span>
                <span className="text-lg font-medium">{prescription.pd}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm text-muted-foreground block mb-1">Clinical Notes</span>
                <p className="text-foreground">{prescription.notes || "No additional notes recorded."}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="patient" className="space-y-6">
          {customer ? (
            <CustomerPrescriptionCard customer={customer} latestPrescription={prescription} />
          ) : (
            <div className="p-6 text-center text-muted-foreground">Patient data not found.</div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-6">Patient Prescription History</h3>
            <PrescriptionHistoryTimeline prescriptions={customerHistory} />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
