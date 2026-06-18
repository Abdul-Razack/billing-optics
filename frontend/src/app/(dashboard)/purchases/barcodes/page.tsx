"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle } from "lucide-react";
import { useFetch } from "@/hooks/useApi";
import { useState } from "react";

export default function BarcodesDashboardPage() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'EDITED' | 'CONFIRMED'>('PENDING');
  
  // Note: in reality, we would pass the status to the API, e.g., `/barcodes?status=${activeTab}`
  const { data: response, isLoading } = useFetch<{ success: boolean, data: any[] }>("/barcodes");
  const allBarcodes = response?.data || [];
  
  // Mock client-side filter for now
  const barcodes = allBarcodes.filter(b => 
    (activeTab === 'PENDING' && b.status === 'PENDING_PRINT') ||
    (activeTab === 'EDITED' && b.status === 'ACTIVE') ||
    (activeTab === 'CONFIRMED' && b.status === 'ACTIVE') // Simplification for UI mock
  );

  return (
    <PageContainer title="Barcode Dashboard" description="Manage barcode generation, printing, and confirmation.">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 bg-muted p-1 rounded-md">
          <Button 
            variant={activeTab === 'PENDING' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('PENDING')}
          >
            Pending Barcodes
          </Button>
          <Button 
            variant={activeTab === 'EDITED' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('EDITED')}
          >
            Edited Barcodes
          </Button>
          <Button 
            variant={activeTab === 'CONFIRMED' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('CONFIRMED')}
          >
            Confirmed Barcodes
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Selected
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Selected
          </Button>
        </div>
      </div>

      <div className="border rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Barcode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Specs (Sph/Cyl)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Batch No</th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : barcodes.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No barcodes found for this status.</td></tr>
            ) : (
              barcodes.map((barcode) => (
                <tr key={barcode.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{barcode.barcodeString}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Product #{barcode.productVariantId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">N/A</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{barcode.batchNumber || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
