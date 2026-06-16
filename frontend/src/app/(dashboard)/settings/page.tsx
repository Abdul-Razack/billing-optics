"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SystemUpdates } from "@/components/settings/SystemUpdates";
import { PosShortcuts } from "@/components/settings/PosShortcuts";
import { OffersSettings } from "@/components/settings/OffersSettings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsService, ApiSettings } from "@/services/settings.service";
import { toast } from "sonner";
import { Loader2, Activity, Database, ChevronRight, ClipboardList } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { fetchClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("business");
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [license, setLicense] = useState<{
    isValid: boolean;
    type?: string;
    daysRemaining?: number;
    message?: string;
    hardwareId?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    await Promise.resolve(); // yield before any setState (React Compiler requirement)
    try {
      setIsLoading(true);
      const [settingsData, licenseData] = await Promise.all([
        SettingsService.getSettings(),
        fetchClient("/license/status").catch(() => null)
      ]);
      setSettings(settingsData);
      setLicense(licenseData as typeof license);
    } catch (error) {
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      void loadSettings();
    });
  }, []);

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
        printerSize: settings.printerSize,
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

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-4 md:pb-0">
            <button 
              onClick={() => setActiveTab("business")}
              className={`px-4 py-2 rounded-md font-medium text-sm text-left transition-colors whitespace-nowrap ${activeTab === "business" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              Business Profile
            </button>
            <button 
              onClick={() => setActiveTab("billing")}
              className={`px-4 py-2 rounded-md font-medium text-sm text-left transition-colors whitespace-nowrap ${activeTab === "billing" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              Billing & GST
            </button>
            <button 
              onClick={() => setActiveTab("preferences")}
              className={`px-4 py-2 rounded-md font-medium text-sm text-left transition-colors whitespace-nowrap ${activeTab === "preferences" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              System Preferences
            </button>
            <button 
              onClick={() => setActiveTab("system-tools")}
              className={`px-4 py-2 rounded-md font-medium text-sm text-left transition-colors whitespace-nowrap ${activeTab === "system-tools" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              System Tools
            </button>
            <button 
              onClick={() => setActiveTab("license")}
              className={`px-4 py-2 rounded-md font-medium text-sm text-left transition-colors whitespace-nowrap ${activeTab === "license" ? "bg-muted text-blue-600 dark:bg-muted/50 dark:text-blue-400" : "text-blue-600/70 dark:text-blue-400/70 hover:bg-muted hover:text-blue-600 dark:hover:text-blue-400"}`}
            >
              License & Activation
            </button>
            <button 
              onClick={() => setActiveTab("pos-shortcuts")}
              className={`px-4 py-2 rounded-md font-medium text-sm text-left transition-colors whitespace-nowrap ${activeTab === "pos-shortcuts" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              POS Shortcuts
            </button>
            <button 
              onClick={() => setActiveTab("offers")}
              className={`px-4 py-2 rounded-md font-medium text-sm text-left transition-colors whitespace-nowrap ${activeTab === "offers" ? "bg-muted text-purple-600 dark:bg-muted/50 dark:text-purple-400" : "text-purple-600/70 dark:text-purple-400/70 hover:bg-muted hover:text-purple-600 dark:hover:text-purple-400"}`}
            >
              Offers & Promotions
            </button>
            <button 
              onClick={() => setActiveTab("system-updates")}
              className={`px-4 py-2 rounded-md font-medium text-sm text-left transition-colors whitespace-nowrap ${activeTab === "system-updates" ? "bg-muted text-green-600 dark:bg-muted/50 dark:text-green-400" : "text-green-600/70 dark:text-green-400/70 hover:bg-muted hover:text-green-600 dark:hover:text-green-400"}`}
            >
              System Updates
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 pb-24">
          
          {activeTab === "business" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
            </div>
          )}

          {activeTab === "billing" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                  <div className="space-y-2">
                    <Label htmlFor="printerSize">Thermal Printer Size</Label>
                    <Select 
                      value={settings.printerSize || "80mm"} 
                      onValueChange={(val) => setSettings(prev => prev ? {...prev, printerSize: val || "80mm"} : null)}
                    >
                      <SelectTrigger id="printerSize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="80mm">80mm (Standard Receipt)</SelectItem>
                        <SelectItem value="58mm">58mm (Small Receipt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                    <Switch 
                      checked={theme === "dark"} 
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
                    />
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === "license" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SettingsSection 
                title="License Management" 
                description="Manage your software activation, hardware ID, and subscription."
              >
                <div className="space-y-6">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-2">License Information</h3>
                    <p className="text-sm text-muted-foreground mb-4">View your current license status and validity.</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`ml-2 font-medium ${license?.isValid ? 'text-green-600' : 'text-red-500'}`}>
                          {license?.isValid ? 'Active' : 'Expired/Invalid'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{license?.type || 'Loading...'}</span>
                      </div>
                      {license?.daysRemaining !== undefined && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Days Remaining:</span>
                          <span className="ml-2 font-medium">{license.daysRemaining} days</span>
                        </div>
                      )}
                      {license?.message && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Message:</span>
                          <span className="ml-2 font-medium">{license.message}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <p className="text-xs text-muted-foreground font-mono">HWID: {license?.hardwareId || 'N/A'}</p>
                      <Button variant="outline" onClick={() => window.location.href = '/activation'}>
                        Manage Activation
                      </Button>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === "system-tools" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SettingsSection 
                title="Advanced System Tools" 
                description="Access diagnostic, maintenance, and administrative utilities for your ERP system."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* System Health Card */}
                  <div 
                    className="rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col"
                    onClick={() => router.push('/system-health')}
                  >
                    <div className="p-6 flex-1">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <Activity className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-lg leading-none tracking-tight mb-2">System Health</h3>
                      <p className="text-sm text-muted-foreground">Monitor real-time application diagnostics, disk space footprint, and general system uptime.</p>
                    </div>
                    <div className="bg-muted/50 px-6 py-3 border-t flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                      <span className="text-sm font-medium text-primary">Open Dashboard</span>
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  {/* Database Maintenance Card */}
                  <div 
                    className="rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col"
                    onClick={() => router.push('/database-maintenance')}
                  >
                    <div className="p-6 flex-1">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <Database className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-lg leading-none tracking-tight mb-2">Database Maintenance</h3>
                      <p className="text-sm text-muted-foreground">Analyze table sizes, view dead rows, and run powerful database optimizations (VACUUM ANALYZE).</p>
                    </div>
                    <div className="bg-muted/50 px-6 py-3 border-t flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                      <span className="text-sm font-medium text-primary">Open Maintenance Tools</span>
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  {/* Audit Logs Card */}
                  <div 
                    className="rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col"
                    onClick={() => router.push('/audit-logs')}
                  >
                    <div className="p-6 flex-1">
                      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-lg leading-none tracking-tight mb-2">Audit Logs</h3>
                      <p className="text-sm text-muted-foreground">View a centralized, immutable history of all critical actions and data changes in the ERP.</p>
                    </div>
                    <div className="bg-muted/50 px-6 py-3 border-t flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                      <span className="text-sm font-medium text-primary">View Audit Logs</span>
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === "system-updates" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SystemUpdates />
            </div>
          )}

          {activeTab === "pos-shortcuts" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <PosShortcuts />
            </div>
          )}

          {activeTab === "offers" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <OffersSettings />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
