"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const handleSave = () => {
    console.log("Mock save settings");
  };

  return (
    <PageContainer title="System Settings" description="Configure your ERP/POS system preferences.">
      <ProductHeader title="Settings" />

      <Tabs defaultValue="business" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto w-full md:w-64 bg-transparent border-0 p-0 justify-start space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto">
          <TabsTrigger value="business" className="data-[state=active]:bg-muted justify-start px-4 py-2 w-full">Business Profile</TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-muted justify-start px-4 py-2 w-full">Billing & GST</TabsTrigger>
          <TabsTrigger value="invoice" className="data-[state=active]:bg-muted justify-start px-4 py-2 w-full">Invoice Template</TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-muted justify-start px-4 py-2 w-full">System Preferences</TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="business" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SettingsSection 
              title="Store Information" 
              description="Update your store details and contact information."
              onSave={handleSave}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" defaultValue="Optics ERP Store" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+91 9876543210" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Store Address</Label>
                  <Textarea id="address" defaultValue="123 Main Street, Cityville, State, 123456" />
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="billing" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SettingsSection 
              title="Tax & Currency Configuration" 
              description="Configure default tax rates and currency formats for billing."
              onSave={handleSave}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GSTIN / Tax ID</Label>
                  <Input id="gstNumber" defaultValue="22AAAAA0000A1Z5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="INR">
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultTax">Default Tax Rate (%)</Label>
                  <Select defaultValue="12">
                    <SelectTrigger id="defaultTax">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% (Tax Exempt)</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="invoice" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SettingsSection 
              title="Invoice Settings" 
              description="Customize how your invoices look and what information they contain."
              onSave={handleSave}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                    <Input id="invoicePrefix" defaultValue="INV-2023-" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextInvoice">Next Invoice Sequence</Label>
                    <Input id="nextInvoice" type="number" defaultValue="1045" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerNotes">Default Footer Notes / T&C</Label>
                  <Textarea 
                    id="footerNotes" 
                    defaultValue="Thank you for your business. Goods once sold cannot be returned without original receipt." 
                    className="h-24"
                  />
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          <TabsContent value="preferences" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SettingsSection 
              title="UI & System Preferences" 
              description="Manage how the application behaves for you."
              onSave={handleSave}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications when inventory falls below minimum threshold.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark theme across the dashboard.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </SettingsSection>
          </TabsContent>
        </div>
      </Tabs>
    </PageContainer>
  );
}
