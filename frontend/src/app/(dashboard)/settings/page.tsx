"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsService, ApiSettings } from "@/services/settings.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SettingsPage() {
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await SettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      await SettingsService.updateSettings({
        businessName: settings.businessName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        gstNumber: settings.gstNumber,
        currency: settings.currency,
        timezone: settings.timezone,
      });
      toast.success("Settings updated successfully.");
    } catch (error) {
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="System Settings" description="Configure your ERP/POS system preferences.">
        <div className="flex justify-center items-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!settings) return null;

  return (
    <PageContainer title="System Settings" description="Configure your ERP/POS system preferences.">
      <ProductHeader title="Settings" />

      <Tabs defaultValue="business" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto w-full md:w-64 bg-transparent border-0 p-0 justify-start space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto">
          <TabsTrigger value="business" className="data-[state=active]:bg-muted justify-start px-4 py-2 w-full">Business Profile</TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-muted justify-start px-4 py-2 w-full">Billing & GST</TabsTrigger>
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
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    value={settings.businessName} 
                    onChange={(e) => setSettings(prev => prev ? {...prev, businessName: e.target.value} : null)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={settings.phone || ""} 
                    onChange={(e) => setSettings(prev => prev ? {...prev, phone: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={settings.email || ""} 
                    onChange={(e) => setSettings(prev => prev ? {...prev, email: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Store Address</Label>
                  <Textarea 
                    id="address" 
                    value={settings.address || ""} 
                    onChange={(e) => setSettings(prev => prev ? {...prev, address: e.target.value} : null)}
                  />
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
                  <Input 
                    id="gstNumber" 
                    value={settings.gstNumber || ""} 
                    onChange={(e) => setSettings(prev => prev ? {...prev, gstNumber: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select 
                    value={settings.currency} 
                    onValueChange={(val) => setSettings(prev => prev ? {...prev, currency: val || "INR"} : null)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(val) => setSettings(prev => prev ? {...prev, timezone: val || "Asia/Kolkata"} : null)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                    </SelectContent>
                  </Select>
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
