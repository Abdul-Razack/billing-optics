"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomerProfileHeader } from "@/components/customers/CustomerProfileHeader";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { CustomerStatsCard } from "@/components/customers/CustomerStatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Calendar, DollarSign, Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/useApi";
import { ApiCustomer } from "@/types/customer";
import { ApiSettings } from "@/services/settings.service";
import { DataTablePlaceholder } from "@/components/tables/DataTablePlaceholder";

interface CustomerWithDetails extends ApiCustomer {
  prescriptions?: any[];
  invoices?: any[];
}

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const { data: response, isLoading, error } = useFetch<{ success: boolean; data: CustomerWithDetails }>(`/customers/${resolvedParams.id}`);
  const { data: settingsResponse } = useFetch<{ success: boolean; data: ApiSettings }>('/settings');
  
  const customer = response?.data;
  const customFieldDefs = settingsResponse?.data?.customFieldDefinitions?.customers || [];

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
        <EmptyState title="Customer Not Found" description="The customer you are trying to view does not exist." />
      </PageContainer>
    );
  }

  const invoices = customer.invoices || [];
  const totalPurchases = invoices.length;
  const lifetimeValue = invoices.reduce((acc: number, inv: any) => acc + (inv.totalAmount || 0), 0);
  const lastVisit = invoices.length > 0 ? new Date(invoices[0].createdAt).toLocaleDateString() : "Never";

  return (
    <PageContainer title="Customer Profile" description="Manage customer details, history, and preferences.">
      <CustomerProfileHeader customer={customer} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CustomerStatsCard 
          title="Total Purchases" 
          value={totalPurchases} 
          icon={<ShoppingBag className="h-4 w-4" />} 
        />
        <CustomerStatsCard 
          title="Lifetime Value" 
          value={`$${(lifetimeValue).toFixed(2)}`} 
          icon={<DollarSign className="h-4 w-4" />} 
        />
        <CustomerStatsCard 
          title="Last Visit" 
          value={lastVisit} 
          icon={<Calendar className="h-4 w-4" />} 
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
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

            {/* Custom Fields rendered inside Overview to match instructions */}
            <div className="col-span-1 md:col-span-2">
              <CustomerCard title="Additional Details">
                {customFieldDefs.length > 0 && customer.customFields && Object.keys(customer.customFields).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {customFieldDefs.map((def) => {
                      const value = customer.customFields[def.id];
                      if (value === undefined || value === null || value === "") return null;
                      
                      const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
                      return (
                        <div key={def.id}>
                          <p className="text-sm text-muted-foreground">{def.name}</p>
                          <p className="font-medium">{displayValue}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No additional attributes configured for this customer.</p>
                )}
              </CustomerCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <CustomerCard 
            title="Purchase History" 
            description="Recent invoices and orders for this customer."
          >
            <DataTablePlaceholder />
          </CustomerCard>
        </TabsContent>

        <TabsContent value="prescriptions">
          <CustomerCard 
            title="Prescription History" 
            description="Past optical prescriptions and measurements."
          >
            <DataTablePlaceholder />
          </CustomerCard>
        </TabsContent>

      </Tabs>
    </PageContainer>
  );
}
