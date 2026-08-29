import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { SalesTab } from "@/components/reports/tabs/SalesTab";
import { InventoryTab } from "@/components/reports/tabs/InventoryTab";
import { TaxesTab } from "@/components/reports/tabs/TaxesTab";
import { CustomersTab } from "@/components/reports/tabs/CustomersTab";
import { CategoriesTab } from "@/components/reports/tabs/CategoriesTab";

export default function ReportsDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "OPTOMETRIST"]}>
      <PageContainer title="Reports & Analytics" description="View business performance and generate reports.">
        <ProductHeader title="Analytics Dashboard">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </ProductHeader>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border h-12 p-1">
            <TabsTrigger value="sales" className="data-[state=active]:bg-background px-6">Sales & Revenue</TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-background px-6">Inventory</TabsTrigger>
            <TabsTrigger value="taxes" className="data-[state=active]:bg-background px-6">GST & Taxes</TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-background px-6">Customers</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-background px-6">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <SalesTab />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <InventoryTab />
          </TabsContent>

          <TabsContent value="taxes" className="space-y-6">
            <TaxesTab />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomersTab />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoriesTab />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </ProtectedRoute>
  );
}
