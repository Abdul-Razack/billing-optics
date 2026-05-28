import { PageContainer } from "@/components/layout/PageContainer";
import { CustomerHeader } from "@/components/customers/CustomerHeader";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { SectionCard } from "@/components/dashboard/SectionCard";

export default function CreateCustomerPage() {
  return (
    <PageContainer title="Customers" description="Add a new customer to your records.">
      <CustomerHeader title="Create Customer" />
      <SectionCard className="max-w-4xl mx-auto">
        <CustomerForm />
      </SectionCard>
    </PageContainer>
  );
}
