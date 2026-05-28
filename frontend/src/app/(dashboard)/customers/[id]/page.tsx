"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomerProfileHeader } from "@/components/customers/CustomerProfileHeader";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { CustomerStatsCard } from "@/components/customers/CustomerStatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Calendar, DollarSign, Loader2, FileText } from "lucide-react";
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
  
  const { data: response, isLoading, error } = useFetch<{ success: boolean; data: CustomerWithDetails }>(`/customers/${resolvedParams.id}?includePrescriptions=true`);
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
        <CustomerStatsCard 
          title="Prescriptions" 
          value={customer.prescriptionCount || 0} 
          icon={<FileText className="h-4 w-4" />} 
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

            {/* Latest Prescription Summary */}
            {customer.latestPrescription && (
              <CustomerCard title="Latest Prescription">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Right Eye (OD)</p>
                      <p className="font-medium">SPH: {customer.latestPrescription.rightEye.sphere}</p>
                      {customer.latestPrescription.rightEye.cylinder && <p>CYL: {customer.latestPrescription.rightEye.cylinder}</p>}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Left Eye (OS)</p>
                      <p className="font-medium">SPH: {customer.latestPrescription.leftEye.sphere}</p>
                      {customer.latestPrescription.leftEye.cylinder && <p>CYL: {customer.latestPrescription.leftEye.cylinder}</p>}
                    </div>
                  </div>
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Recorded on: {new Date(customer.latestPrescription.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CustomerCard>
            )}

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
            {customer.prescriptionHistory && customer.prescriptionHistory.length > 0 ? (
              <div className="space-y-4">
                {customer.prescriptionHistory.map((rx: any) => (
                  <div key={rx.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Prescription #{rx.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(rx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-sm text-right">
                        {rx.pd && <p>PD: {rx.pd}</p>}
                        {rx.addPower && <p>ADD: {rx.addPower}</p>}
                      </div>
                    </div>
                    {rx.notes && (
                      <p className="text-sm bg-muted/50 p-2 rounded mt-2">{rx.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No prescriptions found for this customer.</p>
            )}
          </CustomerCard>
        </TabsContent>

      </Tabs>
    </PageContainer>
  );
}
