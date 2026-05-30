"use client";

import { useEffect, useState } from "react";
import { fetchClient } from "@/lib/api-client";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Database, 
  HardDrive, 
  Server, 
  ShieldCheck, 
  RefreshCw, 
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Archive
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface HealthData {
  application: {
    version: string;
    buildType: string;
    uptimeSeconds: number;
    lastRestart: string;
  };
  database: {
    status: string;
    version: string;
    sizeBytes: number;
  };
  storage: {
    availableBytes: number;
    totalBytes: number;
    backupsSizeBytes: number;
    uploadsSizeBytes: number;
    codeSizeBytes: number;
  };
  backups: {
    status: string;
    lastBackupTime: string | null;
  };
  diagnostics: {
    memoryUsageBytes: number;
    heapUsedBytes: number;
  };
  timestamp: string;
}

export default function SystemHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHealth = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const res = await fetchClient<{ success: boolean; data: HealthData }>("/system-health");
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error("Failed to load system health data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleExport = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("optics_session") || "{}")?.token;
      
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/system-health/export", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to export");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diagnostics_${format(new Date(), "yyyyMMdd_HHmmss")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Diagnostics exported successfully");
    } catch (err) {
      toast.error("Failed to export diagnostics");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !data) {
    return (
      <PageContainer title="System Health" description="Real-time diagnostics and telemetry.">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!data) return null;

  // Compute Overall Status
  let overallStatus: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
  if (data.database.status !== 'Connected' || data.storage.availableBytes < 1024 * 1024 * 100) {
    overallStatus = 'Critical';
  } else if (data.backups.status.includes('Warning') || data.storage.availableBytes < 1024 * 1024 * 1024) {
    overallStatus = 'Warning';
  }

  return (
    <PageContainer title="System Health" description="Real-time diagnostics and telemetry.">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <ProductHeader title="System Status" />
          <p className="text-sm text-muted-foreground">
            Last checked: {formatDistanceToNow(new Date(data.timestamp), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadHealth(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Diagnostics
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card className={`border-l-4 ${overallStatus === 'Healthy' ? 'border-l-green-500' : overallStatus === 'Warning' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${overallStatus === 'Healthy' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : overallStatus === 'Warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                {overallStatus === 'Healthy' && <CheckCircle2 className="h-6 w-6" />}
                {overallStatus === 'Warning' && <AlertTriangle className="h-6 w-6" />}
                {overallStatus === 'Critical' && <XCircle className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="text-xl font-bold">{overallStatus}</h3>
                <p className="text-sm text-muted-foreground">Overall System Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* APP HEALTH */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Server className="mr-2 h-4 w-4" /> Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v{data.application.version}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {Math.floor(data.application.uptimeSeconds / 3600)}h {Math.floor((data.application.uptimeSeconds % 3600) / 60)}m
            </p>
          </CardContent>
        </Card>

        {/* DB HEALTH */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Database className="mr-2 h-4 w-4" /> Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {data.database.status}
              {data.database.status === 'Connected' ? (
                <div className="ml-2 h-2 w-2 rounded-full bg-green-500"></div>
              ) : (
                <div className="ml-2 h-2 w-2 rounded-full bg-red-500"></div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Size: {formatBytes(data.database.sizeBytes)}
            </p>
          </CardContent>
        </Card>

        {/* STORAGE HEALTH */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <HardDrive className="mr-2 h-4 w-4" /> Disk Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(data.storage.availableBytes)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {formatBytes(data.storage.totalBytes)} total
            </p>
          </CardContent>
        </Card>

        {/* BACKUP HEALTH */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Archive className="mr-2 h-4 w-4" /> Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {data.backups.status}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last: {data.backups.lastBackupTime ? formatDistanceToNow(new Date(data.backups.lastBackupTime), { addSuffix: true }) : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><HardDrive className="mr-2 h-5 w-5" /> Storage Breakdown</CardTitle>
            <CardDescription>Directory footprint for the active deployment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">PostgreSQL Database</span>
                <span className="text-sm text-muted-foreground">{formatBytes(data.database.sizeBytes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backup Archives</span>
                <span className="text-sm text-muted-foreground">{formatBytes(data.storage.backupsSizeBytes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Uploads</span>
                <span className="text-sm text-muted-foreground">{formatBytes(data.storage.uploadsSizeBytes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Codebase</span>
                <span className="text-sm text-muted-foreground">{formatBytes(data.storage.codeSizeBytes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><Activity className="mr-2 h-5 w-5" /> Runtime Diagnostics</CardTitle>
            <CardDescription>Live Node.js and OS telemetry.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center"><Clock className="mr-2 h-4 w-4" /> Last Restart</span>
                <span className="text-sm text-muted-foreground">{format(new Date(data.application.lastRestart), 'PPpp')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center"><Server className="mr-2 h-4 w-4" /> RAM Used (RSS)</span>
                <span className="text-sm text-muted-foreground">{formatBytes(data.diagnostics.memoryUsageBytes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center"><ShieldCheck className="mr-2 h-4 w-4" /> Environment</span>
                <span className="text-sm text-muted-foreground uppercase">{data.application.buildType}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
