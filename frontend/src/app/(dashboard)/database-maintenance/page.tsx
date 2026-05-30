"use client";

import { useEffect, useState } from "react";
import { fetchClient } from "@/lib/api-client";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table as TableIcon,
  Database,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Search,
  HardDrive
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TableStat {
  tableName: string;
  sequentialScans: number;
  indexScans: number;
  liveRows: number;
  deadRows: number;
  lastVacuum: string | null;
  lastAutoVacuum: string | null;
  lastAnalyze: string | null;
  lastAutoAnalyze: string | null;
  totalSizeBytes: string;
}

export default function DatabaseMaintenancePage() {
  const [stats, setStats] = useState<TableStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [showOptimizeConfirm, setShowOptimizeConfirm] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetchClient<{ success: boolean; data: TableStat[] }>("/database-maintenance/stats");
      if (res.success) {
        if (Array.isArray(res.data)) {
          setStats(res.data);
        } else if (res.data && Array.isArray((res.data as any).rows)) {
          setStats((res.data as any).rows);
        } else {
          setStats([]);
        }
      }
    } catch (err) {
      toast.error("Failed to load database statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      const res = await fetchClient<{ success: boolean; message: string }>("/database-maintenance/optimize", {
        method: "POST"
      });
      if (res.success) {
        toast.success(res.message);
        loadStats(); // Reload to see dead rows drop to 0
      }
    } catch (err) {
      toast.error("Optimization failed. See logs.");
    } finally {
      setOptimizing(false);
      setShowOptimizeConfirm(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("optics_session") || "{}")?.token;
      
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/database-maintenance/export", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to export");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `db_maintenance_${format(new Date(), "yyyyMMdd_HHmmss")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Maintenance report exported.");
    } catch (err) {
      toast.error("Failed to export report");
    }
  };

  const formatBytes = (bytes: number | string) => {
    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(numBytes) || numBytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = stats.reduce((acc, stat) => acc + parseInt(stat.totalSizeBytes, 10), 0);
  const totalLiveRows = stats.reduce((acc, stat) => acc + parseInt(stat.liveRows as any, 10), 0);
  const totalDeadRows = stats.reduce((acc, stat) => acc + parseInt(stat.deadRows as any, 10), 0);
  
  const healthScore = totalLiveRows > 0 ? Math.max(0, 100 - (totalDeadRows / totalLiveRows) * 100) : 100;

  return (
    <PageContainer title="Database Maintenance" description="Analyze, optimize, and maintain the PostgreSQL database.">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <ProductHeader title="Maintenance Tools" />
          <p className="text-sm text-muted-foreground">
            Administrative tools for optimizing local ERP data.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadStats} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => setShowOptimizeConfirm(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Zap className="mr-2 h-4 w-4" />
            Optimize Database
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Database className="mr-2 h-4 w-4" /> Total Entities size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalSize)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TableIcon className="mr-2 h-4 w-4" /> Live Rows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{totalLiveRows.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" /> Dead Rows (Garbage)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{totalDeadRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Reclaimable via Optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4" /> Table Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on dead tuple ratio
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Table Analysis</CardTitle>
          <CardDescription>Detailed footprint and metrics for each logical table in the schema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Size on Disk</TableHead>
                  <TableHead>Live Rows</TableHead>
                  <TableHead>Dead Rows</TableHead>
                  <TableHead>Index Scans</TableHead>
                  <TableHead>Last Vacuum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No tables found or loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((stat) => (
                    <TableRow key={stat.tableName}>
                      <TableCell className="font-medium text-primary">
                        {stat.tableName}
                      </TableCell>
                      <TableCell>{formatBytes(stat.totalSizeBytes)}</TableCell>
                      <TableCell>{parseInt(stat.liveRows as any, 10).toLocaleString()}</TableCell>
                      <TableCell className={parseInt(stat.deadRows as any, 10) > 0 ? "text-amber-600 dark:text-amber-500 font-medium" : ""}>
                        {parseInt(stat.deadRows as any, 10).toLocaleString()}
                      </TableCell>
                      <TableCell>{parseInt(stat.indexScans as any, 10).toLocaleString()}</TableCell>
                      <TableCell>
                        {stat.lastVacuum || stat.lastAutoVacuum 
                          ? format(new Date(stat.lastVacuum || stat.lastAutoVacuum as string), 'PP p') 
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Confirmation Dialog */}
      <Dialog open={showOptimizeConfirm} onOpenChange={setShowOptimizeConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimize Database</DialogTitle>
            <DialogDescription>
              Are you sure you want to run PostgreSQL VACUUM ANALYZE?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium mb-1">Safe Operation</p>
                <p>This will NOT delete any of your business data (Invoices, Customers, etc). It reclaims physical storage used by updated or deleted records and updates query planner statistics for faster searches.</p>
              </div>
            </div>
            <p className="text-sm">
              Current dead rows to reclaim: <strong className="text-amber-600">{totalDeadRows.toLocaleString()}</strong>
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptimizeConfirm(false)} disabled={optimizing}>
              Cancel
            </Button>
            <Button onClick={handleOptimize} className="bg-amber-600 hover:bg-amber-700 text-white" disabled={optimizing}>
              {optimizing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                "Confirm & Optimize"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
