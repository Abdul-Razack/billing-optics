"use client";

import { useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useFetch } from "@/hooks/useApi";
import { fetchClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Boxes,
  Upload,
  FlaskConical,
  RefreshCw,
  ChevronDown,
  Calendar,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; next?: string }> = {
  PENDING:     { label: "Pending",      next: "SENT_TO_LAB" },
  SENT_TO_LAB: { label: "Sent to Lab",  next: "PROCESSING" },
  PROCESSING:  { label: "Processing",   next: "RECEIVED" },
  RECEIVED:    { label: "Received",     next: "READY" },
  READY:       { label: "Ready",        next: "DELIVERED" },
  DELIVERED:   { label: "Delivered" },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:     "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  SENT_TO_LAB: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  PROCESSING:  "bg-purple-500/10 text-purple-600 border-purple-500/30",
  RECEIVED:    "bg-teal-500/10 text-teal-600 border-teal-500/30",
  READY:       "bg-green-500/10 text-green-600 border-green-500/30",
  DELIVERED:   "bg-muted text-muted-foreground border-border",
};

// ─── Inline status updater ───────────────────────────────────────────────────

function StatusBadge({ job, onUpdated }: { job: any; onUpdated: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const cfg = STATUS_CONFIG[job.status] || { label: job.status };
  const colorClass = STATUS_COLORS[job.status] || "bg-muted text-muted-foreground border-border";

  const advanceStatus = async () => {
    if (!cfg.next || isUpdating) return;
    setIsUpdating(true);
    try {
      await fetchClient(`/lab-jobs/${job.id}`, {
        method: "PATCH",
        data: { status: cfg.next },
      });
      toast.success(`Job moved to "${STATUS_CONFIG[cfg.next]?.label}"`);
      onUpdated();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={advanceStatus}
      disabled={!cfg.next || isUpdating}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all ${colorClass} ${cfg.next ? "cursor-pointer hover:opacity-80 active:scale-95" : "cursor-default"}`}
      title={cfg.next ? `Click to advance to "${STATUS_CONFIG[cfg.next]?.label}"` : "Final status"}
    >
      {isUpdating && <RefreshCw className="h-3 w-3 animate-spin" />}
      {cfg.label}
      {cfg.next && !isUpdating && <ChevronDown className="h-3 w-3 opacity-60" />}
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LabJobsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [refresh, setRefresh] = useState(0);

  const queryString = statusFilter ? `?status=${statusFilter}&_r=${refresh}` : `?_r=${refresh}`;
  const { data: response, isLoading, error } = useFetch<{ success: boolean; data: any[] }>(
    `/lab-jobs${queryString}`
  );

  const labJobs = response?.data || [];
  const triggerRefresh = useCallback(() => setRefresh(r => r + 1), []);

  return (
    <PageContainer title="Lab Jobs" description="Track the manufacturing and fitting status of customer orders.">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Lab Jobs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {labJobs.length} job{labJobs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/lab-jobs/import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/lab-jobs/new">
              <Boxes className="mr-2 h-4 w-4" />
              New Lab Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["", ...Object.keys(STATUS_CONFIG)].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-accent text-muted-foreground"
            }`}
          >
            {s === "" ? "All Statuses" : STATUS_CONFIG[s]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading lab jobs…
        </div>
      ) : error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
          Failed to load lab jobs. Please check if the backend is running.
        </div>
      ) : labJobs.length === 0 ? (
        <EmptyState
          title="No Lab Jobs"
          description={
            statusFilter
              ? `No jobs with status "${STATUS_CONFIG[statusFilter]?.label}".`
              : "Create an invoice to auto-generate a lab job, or manually add one."
          }
          actionLabel="Add Lab Job"
          actionHref="/lab-jobs/new"
          icon={Boxes}
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {labJobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{job.jobTitle}</div>
                    {(job.prescriptionId || job.invoiceItemId) && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {job.prescriptionId && `Rx #${job.prescriptionId}`}
                        {job.prescriptionId && job.invoiceItemId && " · "}
                        {job.invoiceItemId && `Item #${job.invoiceItemId}`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/invoices/${job.invoiceId}`} className="text-primary hover:underline font-mono">
                      #{job.invoiceId}
                    </Link>
                    {job.invoice?.customer && (
                      <div className="text-xs text-muted-foreground mt-0.5">{job.invoice.customer.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {job.vendor ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {job.vendor.name}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">In-house</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {job.expectedDate ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(job.expectedDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge job={job} onUpdated={triggerRefresh} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}


