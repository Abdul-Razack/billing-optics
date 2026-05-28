"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomerHeader } from "@/components/customers/CustomerHeader";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useFetch } from "@/hooks/useApi";
import { ApiCustomer } from "@/types/customer";
import { Loader2 } from "lucide-react";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const { data: response, isLoading, error } = useFetch<{ success: boolean; data: ApiCustomer }>(`/customers/${resolvedParams.id}`);
  
  const customer = response?.data;

  if (isLoading) {
    return (
      <PageContainer title="Customers">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (error || !customer) {
    return (
      <PageContainer title="Customers">
        <EmptyState title="Customer Not Found" description="The customer you are trying to edit does not exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Customers" description="Update customer details.">
      <CustomerHeader title={`Edit ${customer.fullName}`} />
      <SectionCard className="max-w-4xl mx-auto">
        <CustomerForm initialData={customer} />
      </SectionCard>
    </PageContainer>
  );
}
