"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomerProfileHeader } from "@/components/customers/CustomerProfileHeader";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { CustomerStatsCard } from "@/components/customers/CustomerStatsCard";
import { CustomerHistorySection } from "@/components/customers/CustomerHistorySection";
import { MOCK_CUSTOMERS, MOCK_CUSTOMER_FIELDS } from "@/lib/mock-customer-data";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Calendar, DollarSign } from "lucide-react";

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const customer = MOCK_CUSTOMERS.find(c => c.id === resolvedParams.id);

  if (!customer) {
    return (
      <PageContainer title="Customers">
        <EmptyState title="Customer Not Found" description="The customer you are trying to view does not exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Customer Profile" description="Manage customer details, history, and preferences.">
      <CustomerProfileHeader customer={customer} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CustomerStatsCard 
          title="Total Purchases" 
          value={customer.stats.totalPurchases} 
          icon={<ShoppingBag className="h-4 w-4" />} 
        />
        <CustomerStatsCard 
          title="Lifetime Value" 
          value={`$${customer.stats.totalSpent.toFixed(2)}`} 
          icon={<DollarSign className="h-4 w-4" />} 
        />
        <CustomerStatsCard 
          title="Last Visit" 
          value={customer.stats.lastPurchaseDate ? new Date(customer.stats.lastPurchaseDate).toLocaleDateString() : "Never"} 
          icon={<Calendar className="h-4 w-4" />} 
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="custom">Custom Fields</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerCard title="Contact Information">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customer.email || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{customer.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CustomerCard>

            <CustomerCard title="Notes">
              {customer.notes ? (
                <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes added for this customer.</p>
              )}
            </CustomerCard>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <CustomerHistorySection customerId={customer.id} />
        </TabsContent>

        <TabsContent value="prescriptions">
          {/* Note: In a real app we'd have a specific prescription timeline component here. We'll reuse the history section placeholder for now. */}
          <CustomerHistorySection customerId={customer.id} />
        </TabsContent>

        <TabsContent value="payments">
          <CustomerHistorySection customerId={customer.id} />
        </TabsContent>

        <TabsContent value="custom">
          <CustomerCard title="Additional Details">
            {customer.customFields && Object.keys(customer.customFields).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.entries(customer.customFields).map(([key, value]) => {
                  const fieldDef = MOCK_CUSTOMER_FIELDS.find(f => f.id === key);
                  // Format boolean values gracefully
                  const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
                  return (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground">{fieldDef?.name || key}</p>
                      <p className="font-medium">{displayValue}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No additional attributes configured for this customer.</p>
            )}
          </CustomerCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
