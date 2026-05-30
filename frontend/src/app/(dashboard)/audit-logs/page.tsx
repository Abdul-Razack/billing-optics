"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuditLogsTable, AuditLog } from "@/components/audit/AuditLogsTable";
import { fetchClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const fetchLogs = async (currentFilters: Record<string, string>) => {
    await Promise.resolve(); // yield to event loop before any setState
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, String(value));
        }
      });
      
      const response = await fetchClient(`/audit-logs?${queryParams.toString()}`) as { data: AuditLog[]; total: number };
      setLogs(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });
      
      const response = await fetch(`http://localhost:5000/api/audit-logs/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_export_${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Audit logs exported successfully");
    } catch (error) {
      toast.error("Failed to export audit logs");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <PageContainer 
        title="Audit Logs" 
        description="View a complete, immutable history of all system events."
      >
        <ProductHeader title="Audit & Activity Logs" />
        
        <Card className="mt-6 mb-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-start gap-4 text-sm text-blue-800 dark:text-blue-300">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Immutable Activity Trail</p>
              <p>
                These logs are cryptographically secure and append-only. 
                They cannot be edited or deleted by any user, ensuring complete accountability for system actions, data changes, and authentication attempts.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <AuditLogsTable 
            logs={logs} 
            total={total} 
            loading={loading} 
            onFilterChange={handleFilterChange}
            onExport={handleExport}
          />
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
