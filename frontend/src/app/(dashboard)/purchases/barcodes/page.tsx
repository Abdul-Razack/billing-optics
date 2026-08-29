"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle } from "lucide-react";
import { useFetch } from "@/hooks/useApi";
import { fetchClient } from "@/lib/api-client";
import { useState } from "react";
import Barcode from "react-barcode";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function BarcodesDashboardPage() {
  const [activeTab, setActiveTab] = useState<'PENDING_PRINT' | 'ACTIVE'>('PENDING_PRINT');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const { data: response, isLoading, refetch } = useFetch<{ success: boolean, data: any[] }>(`/barcodes?status=${activeTab}`);
  const barcodes = response?.data || [];

  const PRINT_BATCH_LIMIT = 100;

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= PRINT_BATCH_LIMIT) {
        toast.error(`You can only select up to ${PRINT_BATCH_LIMIT} barcodes at once to prevent memory issues.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleAll = () => {
    if (selectedIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(barcodes.slice(0, PRINT_BATCH_LIMIT).map(b => b.id));
      if (barcodes.length > PRINT_BATCH_LIMIT) {
        toast.info(`Selected the first ${PRINT_BATCH_LIMIT} barcodes due to performance limits.`);
      }
    }
  };

  const handlePrintClick = () => {
    if (selectedIds.length === 0) return toast.error("Select at least one barcode to print");
    if (selectedIds.length > PRINT_BATCH_LIMIT) return toast.error(`Maximum ${PRINT_BATCH_LIMIT} barcodes allowed per batch.`);
    setShowPrintModal(true);
  };

  const markAsPrinted = async () => {
    try {
      await fetchClient("/barcodes/mark-printed", { data: { barcodeIds: selectedIds } });
      toast.success(`${selectedIds.length} barcodes marked as printed!`);
      setShowPrintModal(false);
      setSelectedIds([]);
      refetch(); // refresh table
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as printed");
    }
  };

  const selectedBarcodes = barcodes.filter(b => selectedIds.includes(b.id));

  return (
    <PageContainer title="Barcode Dashboard" description="Manage barcode generation, printing, and confirmation.">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 bg-muted p-1 rounded-md">
          <Button 
            variant={activeTab === 'PENDING_PRINT' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => { setActiveTab('PENDING_PRINT'); setSelectedIds([]); }}
          >
            Pending Print
          </Button>
          <Button 
            variant={activeTab === 'ACTIVE' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => { setActiveTab('ACTIVE'); setSelectedIds([]); }}
          >
            Printed & Active
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'PENDING_PRINT' && (
            <Button variant="default" onClick={handlePrintClick}>
              <Printer className="mr-2 h-4 w-4" />
              Print Selected Stickers
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={selectedIds.length === barcodes.length && barcodes.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Barcode String</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Variant ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Created</th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : barcodes.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No barcodes found.</td></tr>
            ) : (
              barcodes.map((barcode) => (
                <tr key={barcode.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={selectedIds.includes(barcode.id)}
                      onChange={() => toggleSelect(barcode.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{barcode.barcodeString}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Product #{barcode.productVariantId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${barcode.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {barcode.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(barcode.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Print Modal */}
      <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Print Barcode Stickers</DialogTitle>
            <DialogDescription>
              Preview of {selectedBarcodes.length} barcode(s). You can print this page using your browser&apos;s print dialog (Ctrl+P). Once printed, click &quot;Mark as Printed&quot; to move them to the Active pool.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-white text-black print:grid-cols-3 print:gap-4 print:p-0">
            {selectedBarcodes.map(b => (
              <div key={b.id} className="border border-dashed border-gray-400 p-2 flex flex-col items-center justify-center print:border-none print:break-inside-avoid">
                <Barcode 
                  value={b.barcodeString} 
                  format="CODE128"
                  width={1.5}
                  height={50}
                  fontSize={14}
                  background="#ffffff"
                  lineColor="#000000"
                  renderer="canvas"
                />
                <span className="text-xs mt-1 font-semibold text-gray-600">Product #{b.productVariantId}</span>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print via Browser
            </Button>
            <Button onClick={markAsPrinted}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Printed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
