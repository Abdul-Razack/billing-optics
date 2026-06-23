"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { useFetch } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Users, Upload } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";

export default function VendorsPage() {
  const { data: response, isLoading, error } = useFetch<{ success: boolean, data: any[] }>("/vendors");
  const vendors = response?.data || [];

  return (
    <PageContainer title="Vendors" description="Manage your lab suppliers and manufacturers.">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/vendors/import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/vendors/new">Add Vendor</Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading vendors...</div>
      ) : error ? (
        <div className="p-4 rounded bg-destructive/10 text-destructive border border-destructive/20">
          Failed to load vendors.
        </div>
      ) : vendors.length === 0 ? (
        <EmptyState
          title="No Vendors Found"
          description="You haven't added any lab suppliers yet."
          actionLabel="Add Vendor"
          actionHref="/vendors/new"
          icon={Users}
        />
      ) : (
        <div className="border rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{vendor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{vendor.contactPerson || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{vendor.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
