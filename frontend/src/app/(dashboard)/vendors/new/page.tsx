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

export default function CreateVendorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      contactPerson: formData.get("contactPerson"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
    };

    try {
      await fetchClient("/vendors", {
        method: "POST",
        data,
      });
      toast.success("Vendor created successfully");
      router.push("/vendors");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create vendor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Vendors" description="Add a new lab supplier to your records.">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vendors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Vendor</h1>
      </div>

      <SectionCard className="max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Name *</label>
              <Input name="name" required placeholder="e.g. Optical Lab Inc." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person</label>
              <Input name="contactPerson" placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input name="phone" placeholder="e.g. 9876543210" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input name="email" type="email" placeholder="e.g. support@lab.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input name="address" placeholder="Full address" />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Vendor
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageContainer>
  );
}
