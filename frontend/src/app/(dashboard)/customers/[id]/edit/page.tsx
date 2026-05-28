"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";
import { EmptyState } from "@/components/shared/EmptyState";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const customer = MOCK_CUSTOMERS.find(c => c.id === resolvedParams.id);

  if (!customer) {
    return (
      <PageContainer title="Customers">
        <EmptyState title="Customer Not Found" description="The customer you are trying to edit does not exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Customers" description="Update customer details.">
      <ProductHeader title={`Edit ${customer.fullName}`} />
      <SectionCard className="max-w-4xl mx-auto">
        <CustomerForm initialData={customer} />
      </SectionCard>
    </PageContainer>
  );
}
