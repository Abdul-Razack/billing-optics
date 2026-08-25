"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchClient } from "@/lib/api-client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Search, FlaskConical, Eye } from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/useApi";

// ─── Prescription preview panel ─────────────────────────────────────────────

function RxPreview({ prescription }: { prescription: any }) {
  if (!prescription) return null;
  const tests = prescription.tests || [];
  const displayTest =
    tests.find((t: any) => t.testType === "SPECTACLE") ||
    tests.find((t: any) => t.testType === "MANUAL_TESTING") ||
    tests[0];

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Eye className="h-4 w-4 text-primary" />
        Linked Prescription #{prescription.id}
        {prescription.prescriptionType && (
          <span className="text-xs text-muted-foreground">({prescription.prescriptionType})</span>
        )}
      </div>
      {displayTest ? (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide">Right Eye (OD)</p>
            <p>SPH: <span className="font-mono">{displayTest.rightEyeDvSph || "—"}</span></p>
            <p>CYL: <span className="font-mono">{displayTest.rightEyeDvCyl || "—"}</span></p>
            <p>AXIS: <span className="font-mono">{displayTest.rightEyeDvAxis ?? "—"}</span></p>
            <p>ADD: <span className="font-mono">{displayTest.rightEyeAdd || "—"}</span></p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide">Left Eye (OS)</p>
            <p>SPH: <span className="font-mono">{displayTest.leftEyeDvSph || "—"}</span></p>
            <p>CYL: <span className="font-mono">{displayTest.leftEyeDvCyl || "—"}</span></p>
            <p>AXIS: <span className="font-mono">{displayTest.leftEyeDvAxis ?? "—"}</span></p>
            <p>ADD: <span className="font-mono">{displayTest.leftEyeAdd || "—"}</span></p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No test readings recorded for this prescription.</p>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CreateLabJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [selectedInvoiceItemId, setSelectedInvoiceItemId] = useState<number | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [vendorId, setVendorId] = useState("");

  const { data: vendorsResponse } = useFetch<{ success: boolean; data: any[] }>("/vendors");
  const vendors = vendorsResponse?.data || [];

  const { data: invoicesResponse } = useFetch<{ success: boolean; data: any[] }>(
    `/invoices?search=${encodeURIComponent(invoiceSearch || "")}&limit=8`,
    { enabled: invoiceSearch.length >= 1 }
  );
  const invoices = invoicesResponse?.data || [];

  const { data: invoiceDetailRes } = useFetch<{ success: boolean; data: any }>(
    `/invoices/${selectedInvoiceId ?? 0}`,
    { enabled: selectedInvoiceId !== null }
  );
  const invoiceItems = invoiceDetailRes?.data?.items || [];

  const { data: prescriptionRes } = useFetch<{ success: boolean; data: any }>(
    `/prescriptions/${selectedPrescriptionId ?? 0}`,
    { enabled: selectedPrescriptionId !== null }
  );
  const prescription = prescriptionRes?.data;

  const handleSelectInvoice = (inv: any) => {
    setSelectedInvoiceId(inv.id);
    setInvoiceSearch(`Invoice #${inv.id}`);
    if (!jobTitle) setJobTitle(`Lab Job — Invoice #${inv.id}`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) { toast.error("Please select an invoice first."); return; }
    setIsLoading(true);
    try {
      await fetchClient("/lab-jobs", {
        method: "POST",
        data: {
          jobTitle,
          invoiceId: selectedInvoiceId,
          invoiceItemId: selectedInvoiceItemId || undefined,
          prescriptionId: selectedPrescriptionId || undefined,
          vendorId: vendorId ? parseInt(vendorId, 10) : undefined,
          notes: notes || undefined,
          expectedDate: expectedDate || undefined,
        },
      });
      toast.success("Lab Job created successfully");
      router.push("/lab-jobs");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create lab job");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Lab Jobs" description="Create a new lab tracking job.">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/lab-jobs"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Create Lab Job
        </h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Step 1 */}
        <SectionCard>
          <div className="space-y-4">
            <h2 className="text-base font-semibold">Step 1 — Link to Invoice</h2>
            <div className="space-y-2">
              <Label>Search Invoice</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Type invoice number or customer name…"
                  value={invoiceSearch}
                  onChange={(e) => { setInvoiceSearch(e.target.value); setSelectedInvoiceId(null); }}
                />
              </div>
              {invoices.length > 0 && !selectedInvoiceId && (
                <div className="border border-border rounded-lg divide-y divide-border shadow-sm overflow-hidden">
                  {invoices.map((inv: any) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => handleSelectInvoice(inv)}
                      className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors"
                    >
                      <span className="font-mono text-sm font-medium">#{inv.id}</span>
                      {inv.customer && <span className="text-sm text-muted-foreground ml-2">— {inv.customer.name}</span>}
                      <span className="text-xs text-muted-foreground ml-2">
                        {inv.status} · {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedInvoiceId && <p className="text-xs text-green-600 font-medium">✓ Invoice #{selectedInvoiceId} selected</p>}
            </div>
            {invoiceItems.length > 0 && (
              <div className="space-y-2">
                <Label>Select Lens Line Item <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <div className="space-y-1">
                  {invoiceItems.map((item: any) => (
                    <label key={item.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-accent transition-colors">
                      <input
                        type="radio"
                        name="invoiceItem"
                        value={item.id}
                        checked={selectedInvoiceItemId === item.id}
                        onChange={() => {
                          setSelectedInvoiceItemId(item.id);
                          if (item.prescriptionId) setSelectedPrescriptionId(item.prescriptionId);
                        }}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">{item.snapshotName}</span>
                      <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                      {item.lensSource && (
                        <span className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">
                          {item.lensSource === "ADD_NEW" ? "Stock Lens" : "Customer Lens"}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Step 2 */}
        <SectionCard>
          <div className="space-y-4">
            <h2 className="text-base font-semibold">Step 2 — Link Prescription <span className="text-muted-foreground font-normal text-sm">(optional)</span></h2>
            <div className="space-y-2">
              <Label htmlFor="prescriptionId">Prescription ID</Label>
              <Input
                id="prescriptionId"
                type="number"
                placeholder="e.g. 42"
                value={selectedPrescriptionId || ""}
                onChange={(e) => setSelectedPrescriptionId(e.target.value ? parseInt(e.target.value, 10) : null)}
              />
              <p className="text-xs text-muted-foreground">Enter the prescription ID to auto-populate clinical parameters.</p>
            </div>
            <RxPreview prescription={prescription} />
          </div>
        </SectionCard>

        {/* Step 3 */}
        <SectionCard>
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-base font-semibold">Step 3 — Job Details</h2>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input id="jobTitle" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Progressive Lens for John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor / Lab</Label>
                <select
                  id="vendorId"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">— In-house —</option>
                  {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDate">Expected Date</Label>
                <Input id="expectedDate" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Lab Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions for the lab?" />
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isLoading || !selectedInvoiceId}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Lab Job
              </Button>
            </div>
          </form>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
