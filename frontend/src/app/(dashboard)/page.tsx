import { PageContainer } from "@/components/layout/PageContainer";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { DataTablePlaceholder } from "@/components/tables/DataTablePlaceholder";
import { Users, FileText, Package, DollarSign } from "lucide-react";

export default function DashboardPage() {
  return (
    <PageContainer 
      title="Dashboard" 
      description="Overview of your business metrics and recent activity."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-4 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold text-foreground">$14,520</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-4 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Invoices</p>
            <p className="text-2xl font-semibold text-foreground">342</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-4 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Customers</p>
            <p className="text-2xl font-semibold text-foreground">1,204</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-4 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Products Sold</p>
            <p className="text-2xl font-semibold text-foreground">85</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <SectionCard title="Recent Activity" description="Latest invoices and transactions.">
            <DataTablePlaceholder />
          </SectionCard>
        </div>

        {/* Low Stock Placeholder */}
        <div className="lg:col-span-1">
          <SectionCard title="Low Stock Alerts" description="Products that need restocking.">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-md border border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-background rounded-md flex items-center justify-center border border-border">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Premium Frame {i}</p>
                      <p className="text-xs text-muted-foreground">Stock: {i + 1} left</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                    Low
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
