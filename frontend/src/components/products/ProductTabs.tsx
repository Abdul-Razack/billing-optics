import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductInfoCard } from "./ProductInfoCard";
import { DataTablePlaceholder } from "@/components/tables/DataTablePlaceholder";
import { ReactNode } from "react";

interface ProductTabsProps {
  overviewContent: ReactNode;
  attributesContent: ReactNode;
}

export function ProductTabs({ overviewContent, attributesContent }: ProductTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-muted/50 p-1">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="attributes">Dynamic Attributes</TabsTrigger>
        <TabsTrigger value="inventory">Inventory History</TabsTrigger>
        <TabsTrigger value="sales">Sales History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-0 outline-none">
        {overviewContent}
      </TabsContent>

      <TabsContent value="attributes" className="mt-0 outline-none">
        {attributesContent}
      </TabsContent>

      <TabsContent value="inventory" className="mt-0 outline-none">
        <ProductInfoCard title="Inventory History" description="Recent stock adjustments, purchases, and restocks.">
          <DataTablePlaceholder />
        </ProductInfoCard>
      </TabsContent>

      <TabsContent value="sales" className="mt-0 outline-none">
        <ProductInfoCard title="Sales History" description="Recent invoices containing this product.">
          <DataTablePlaceholder />
        </ProductInfoCard>
      </TabsContent>
    </Tabs>
  );
}
