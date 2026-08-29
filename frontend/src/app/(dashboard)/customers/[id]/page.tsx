"use client";

import { use } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { CustomerProfileHeader } from "@/components/customers/CustomerProfileHeader";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { CustomerStatsCard } from "@/components/customers/CustomerStatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Calendar, DollarSign, Loader2, FileText, BookOpen } from "lucide-react";
import { useFetch } from "@/hooks/useApi";
import { ApiCustomer } from "@/types/customer";
import { ApiSettings } from "@/services/settings.service";
import { OrderService } from "@/services/order.service";
import { OrderTable } from "@/components/orders/OrderTable";
import { ApiInvoice, ApiPayment } from "@/types/order";
import { Prescription } from "@/types/prescription";
import { formatCurrency } from "@/lib/utils";

interface CustomerWithDetails extends ApiCustomer {
  prescriptions?: Prescription[];
  invoices?: ApiInvoice[];
}

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const { data: response, isLoading, error, refetch } = useFetch<{ success: boolean; data: CustomerWithDetails }>(
    resolvedParams.id && resolvedParams.id !== "undefined" ? `/customers/${resolvedParams.id}?includePrescriptions=true` : "",
    { enabled: !!(resolvedParams.id && resolvedParams.id !== "undefined") }
  );
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
  const lifetimeValue = invoices.reduce((acc: number, inv: ApiInvoice) => acc + (inv.grandTotal || 0), 0);
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
          <TabsTrigger value="ledger"><BookOpen className="h-3.5 w-3.5 mr-1.5" />Ledger</TabsTrigger>
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
                      <p className="font-medium">SPH: {customer.latestPrescription.tests?.[0]?.rightEyeDv?.sph || "—"}</p>
                      {customer.latestPrescription.tests?.[0]?.rightEyeDv?.cyl && <p>CYL: {customer.latestPrescription.tests[0].rightEyeDv.cyl}</p>}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Left Eye (OS)</p>
                      <p className="font-medium">SPH: {customer.latestPrescription.tests?.[0]?.leftEyeDv?.sph || "—"}</p>
                      {customer.latestPrescription.tests?.[0]?.leftEyeDv?.cyl && <p>CYL: {customer.latestPrescription.tests[0].leftEyeDv.cyl}</p>}
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
            <OrderTable 
              orders={invoices} 
              sortBy="date"
              sortDirection="desc"
              onSort={() => {}}
              onDeliveryStatusChange={async (id, status) => {
                try {
                  await OrderService.updateDeliveryStatus(id, status);
                  // Refresh data seamlessly
                  refetch();
                } catch (e) {
                  console.error(e);
                }
              }}
            />
          </CustomerCard>
        </TabsContent>

        <TabsContent value="prescriptions">
          <CustomerCard 
            title="Prescription History" 
            description="Past optical prescriptions and measurements."
          >
            {customer.prescriptionHistory && customer.prescriptionHistory.length > 0 ? (
              <div className="space-y-4">
                {customer.prescriptionHistory.map((rx: Prescription) => (
                  <Link
                    key={rx.id}
                    href={`/prescriptions/${rx.id}`}
                    className="block p-4 border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Prescription #{rx.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(rx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-sm text-right">
                        {(rx.tests?.[0]?.rightEyePd || rx.tests?.[0]?.leftEyePd) && <p>PD: {rx.tests[0].rightEyePd || rx.tests[0].leftEyePd}</p>}
                        {rx.tests?.[0]?.rightEyeAdd && <p>ADD: {rx.tests[0].rightEyeAdd}</p>}
                      </div>
                    </div>
                    {rx.notes && (
                      <p className="text-sm bg-muted/50 p-2 rounded mt-2">{rx.notes}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No prescriptions found for this customer.</p>
            )}
          </CustomerCard>
        </TabsContent>

        <TabsContent value="ledger">
          <CustomerCard title="Customer Ledger" description="Financial Dr/Cr history for this account.">
            {(() => {
              // Build ledger rows from invoices + their payments
              type LedgerRow = { date: string; description: string; dr: number; cr: number; balance: number };
              const rows: LedgerRow[] = [];
              let balance = 0;
              const allInvoices = [...invoices].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
              for (const inv of allInvoices) {
                // DR — invoice created
                balance += inv.grandTotal;
                rows.push({
                  date: inv.createdAt,
                  description: `Invoice ${inv.invoiceNumber || `#${inv.id}`}`,
                  dr: inv.grandTotal,
                  cr: 0,
                  balance,
                });
                // CR — each payment
                for (const pmt of (inv.payments || [])) {
                  balance -= pmt.amount;
                  rows.push({
                    date: pmt.createdAt || inv.createdAt,
                    description: `Payment — ${pmt.paymentMethod}`,
                    dr: 0,
                    cr: pmt.amount,
                    balance,
                  });
                }
              }
              if (rows.length === 0) return (
                <p className="text-sm text-muted-foreground text-center py-8">No ledger entries yet.</p>
              );
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">Date</th>
                        <th className="text-left py-2 pr-4 font-medium">Description</th>
                        <th className="text-right py-2 pr-4 font-medium text-red-600">Dr (Debit)</th>
                        <th className="text-right py-2 pr-4 font-medium text-green-600">Cr (Credit)</th>
                        <th className="text-right py-2 font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${row.dr > 0 ? 'bg-red-50/30' : 'bg-green-50/30'}`}>
                          <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                            {new Date(row.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-2 pr-4 font-medium">{row.description}</td>
                          <td className="py-2 pr-4 text-right text-red-600">
                            {row.dr > 0 ? formatCurrency(row.dr) : ""}
                          </td>
                          <td className="py-2 pr-4 text-right text-green-600">
                            {row.cr > 0 ? formatCurrency(row.cr) : ""}
                          </td>
                          <td className={`py-2 text-right font-semibold ${row.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Math.abs(row.balance))}
                            <span className="ml-1 text-xs font-normal">{row.balance > 0 ? 'Dr' : 'Cr'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td colSpan={2} className="py-3 text-muted-foreground">Closing Balance</td>
                        <td className="py-3 text-right text-red-600">{formatCurrency(rows.reduce((s, r) => s + r.dr, 0))}</td>
                        <td className="py-3 pr-4 text-right text-green-600">{formatCurrency(rows.reduce((s, r) => s + r.cr, 0))}</td>
                        <td className={`py-3 text-right ${(rows[rows.length - 1]?.balance ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(Math.abs(rows[rows.length - 1]?.balance ?? 0))}
                          <span className="ml-1 text-xs font-normal">{(rows[rows.length - 1]?.balance ?? 0) > 0 ? 'Dr' : 'Cr'}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })()}
          </CustomerCard>
        </TabsContent>

      </Tabs>
    </PageContainer>
  );
}
