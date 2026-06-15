"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchClient } from "@/lib/api-client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/useApi";

export default function CreateLabJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch vendors for the dropdown
  const { data: vendorsResponse } = useFetch<{ success: boolean, data: any[] }>("/vendors");
  const vendors = vendorsResponse?.data || [];

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      jobTitle: formData.get("jobTitle"),
      invoiceId: parseInt(formData.get("invoiceId") as string, 10),
      vendorId: formData.get("vendorId") ? parseInt(formData.get("vendorId") as string, 10) : undefined,
      notes: formData.get("notes"),
    };

    try {
      await fetchClient("/lab-jobs", {
        method: "POST",
        data,
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
          <Link href="/lab-jobs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Lab Job</h1>
      </div>

      <SectionCard className="max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title *</label>
              <Input name="jobTitle" required placeholder="e.g. Progressive Lens for John Doe" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice ID (Number) *</label>
              <Input name="invoiceId" type="NUMBER" required placeholder="e.g. 1" />
              <p className="text-xs text-muted-foreground">The ID of the invoice this job is associated with.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Vendor</label>
              <select 
                name="vendorId" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- No Vendor / In-house --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input name="notes" placeholder="Any special instructions for the lab?" />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Create Job
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageContainer>
  );
}
