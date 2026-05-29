import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportCard } from "@/components/reports/ReportCard";
import { ChartPlaceholder } from "@/components/reports/ChartPlaceholder";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, DollarSign, Package, Users, Receipt } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard 
              title="Total Revenue" 
              value="₹4,25,000" 
              icon={DollarSign}
              trend={{ value: "12%", positive: true }}
              description="vs last month"
            />
            <ReportCard 
              title="Sales Volume" 
              value="342" 
              icon={TrendingUp}
              trend={{ value: "8%", positive: true }}
              description="vs last month"
            />
            <ReportCard 
              title="Average Order Value" 
              value="₹1,242" 
              icon={Receipt}
              trend={{ value: "2%", positive: false }}
              description="vs last month"
            />
            <ReportCard 
              title="Pending Dues" 
              value="₹45,200" 
              icon={DollarSign}
              trend={{ value: "5%", positive: false }}
              description="vs last month"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartPlaceholder title="Revenue Trend" type="line" height="h-96" />
            </div>
            <div>
              <ChartPlaceholder title="Sales by Category" type="pie" height="h-96" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReportCard 
              title="Total Stock Value" 
              value="₹12,40,000" 
              icon={Package}
            />
            <ReportCard 
              title="Low Stock Items" 
              value="24" 
              icon={TrendingUp}
              trend={{ value: "Needs attention", positive: false }}
            />
            <ReportCard 
              title="Fastest Moving" 
              value="Ray-Ban Aviator" 
              icon={Package}
              description="142 units sold this month"
            />
          </div>
          <ChartPlaceholder title="Stock Movement Analysis" type="bar" height="h-[400px]" />
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReportCard 
              title="Total GST Collected" 
              value="₹76,500" 
              icon={Receipt}
              description="Current Quarter"
            />
            <ReportCard 
              title="Taxable Value" 
              value="₹3,48,500" 
              icon={DollarSign}
              description="Current Quarter"
            />
          </div>
          <ChartPlaceholder title="GST Collection by Tax Rate (5%, 12%, 18%)" type="bar" />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReportCard 
              title="Total Customers" 
              value="1,248" 
              icon={Users}
              trend={{ value: "15%", positive: true }}
              description="New registrations"
            />
            <ReportCard 
              title="Repeat Customer Rate" 
              value="42%" 
              icon={Users}
            />
            <ReportCard 
              title="Avg. Visit Frequency" 
              value="1.8 years" 
              icon={TrendingUp}
            />
          </div>
          <ChartPlaceholder title="Customer Acquisition Trend" type="line" />
        </TabsContent>
      </Tabs>
    </PageContainer>
    </ProtectedRoute>
  );
}
