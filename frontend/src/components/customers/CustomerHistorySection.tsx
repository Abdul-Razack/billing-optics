import { CustomerCard } from "./CustomerCard";
import { DataTablePlaceholder } from "@/components/tables/DataTablePlaceholder";

interface CustomerHistorySectionProps {
  customerId: string | number;
}

export function CustomerHistorySection({ customerId }: CustomerHistorySectionProps) {
  // In a real app, we would fetch history data based on customerId here.
  // For the frontend architecture, we'll use our mock placeholders.
  
  return (
    <div className="space-y-6">
      <CustomerCard 
        title="Purchase History" 
        description="Recent invoices and orders for this customer."
      >
        <DataTablePlaceholder />
      </CustomerCard>
      
      <CustomerCard 
        title="Prescription History" 
        description="Past optical prescriptions and measurements."
      >
        <DataTablePlaceholder />
      </CustomerCard>

      <CustomerCard 
        title="Payment History" 
        description="Recent payments and outstanding balances."
      >
        <DataTablePlaceholder />
      </CustomerCard>
    </div>
  );
}
