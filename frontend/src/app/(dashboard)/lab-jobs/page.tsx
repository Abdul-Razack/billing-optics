"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { useFetch } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Boxes, Upload } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";

export default function LabJobsPage() {
  const { data: response, isLoading, error } = useFetch<{ success: boolean, data: any[] }>("/lab-jobs");
  const labJobs = response?.data || [];

  return (
    <PageContainer title="Lab Jobs" description="Track the manufacturing status of customer orders.">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Lab Jobs</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/lab-jobs/import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button>New Lab Job</Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading lab jobs...</div>
      ) : error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
          Failed to load lab jobs. Please check if the backend is running.
        </div>
      ) : labJobs.length === 0 ? (
        <EmptyState
          title="No Lab Jobs Yet"
          description="There are currently no active lab jobs. Create an invoice to automatically generate a lab job, or manually add one."
          actionLabel="Add Lab Job"
          actionHref="/lab-jobs/new"
          icon={Boxes}
        />
      ) : (
        <div className="border rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {labJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{job.jobTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">#{job.invoiceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
