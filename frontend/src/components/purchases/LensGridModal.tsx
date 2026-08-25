"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchClient } from "@/lib/api-client";
import { useFetch } from "@/hooks/useApi";
import { toast } from "sonner";
import { Loader2, Grid3X3 } from "lucide-react";

const SPH_STEPS = [
  "-8.00","-7.75","-7.50","-7.25","-7.00","-6.75","-6.50","-6.25",
  "-6.00","-5.75","-5.50","-5.25","-5.00","-4.75","-4.50","-4.25",
  "-4.00","-3.75","-3.50","-3.25","-3.00","-2.75","-2.50","-2.25",
  "-2.00","-1.75","-1.50","-1.25","-1.00","-0.75","-0.50","-0.25",
  "0.00",
  "+0.25","+0.50","+0.75","+1.00","+1.25","+1.50","+1.75","+2.00",
  "+2.25","+2.50","+2.75","+3.00","+3.25","+3.50","+3.75","+4.00",
];

const CYL_STEPS = [
  "0.00","-0.25","-0.50","-0.75","-1.00","-1.25",
  "-1.50","-1.75","-2.00","-2.25","-2.50","-2.75",
  "-3.00","-3.25","-3.50","-3.75","-4.00",
];

interface LensGridModalProps {
  purchaseId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LensGridModal({ purchaseId, isOpen, onClose, onSuccess }: LensGridModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [defaultUnitCost, setDefaultUnitCost] = useState(0);
  const [gridQty, setGridQty] = useState<Record<string, number>>({});
  const [sphMin, setSphMin] = useState("-4.00");
  const [sphMax, setSphMax] = useState("+2.00");

  const { data: productsRes } = useFetch<{ success: boolean; data: any[] }>("/products?limit=200");
  const products = (productsRes?.data || []).filter(
    (p: any) => p.categoryName?.toLowerCase().includes("lens") || p.category?.name?.toLowerCase().includes("lens")
  );

  const { data: locationsRes } = useFetch<{ success: boolean; data: any[] }>("/locations");
  const locations = locationsRes?.data || [];

  const visibleSphSteps = useMemo(() => {
    const minIdx = SPH_STEPS.indexOf(sphMin);
    const maxIdx = SPH_STEPS.indexOf(sphMax);
    if (minIdx === -1 || maxIdx === -1) return SPH_STEPS.slice(16, 41);
    return SPH_STEPS.slice(minIdx, maxIdx + 1);
  }, [sphMin, sphMax]);

  const setCell = (sph: string, cyl: string, qty: number) => {
    setGridQty(prev => ({ ...prev, [`${sph}|${cyl}`]: qty }));
  };
  const getCell = (sph: string, cyl: string): number => gridQty[`${sph}|${cyl}`] || 0;
  const activeCells = Object.values(gridQty).filter(q => q > 0).length;
  const totalQty = Object.values(gridQty).reduce((sum, q) => sum + q, 0);

  const handleSubmit = async () => {
    if (!selectedProductId) { toast.error("Please select a lens product."); return; }
    if (!locationId) { toast.error("Please select a receiving location."); return; }
    if (totalQty === 0) { toast.error("No quantities entered in the grid."); return; }

    const lensGrid = Object.entries(gridQty)
      .filter(([, qty]) => qty > 0)
      .map(([key, qty]) => {
        const [sph, cyl] = key.split("|");
        return { sph, cyl, qty, unitCost: Math.round(defaultUnitCost * 100) };
      });

    setIsSubmitting(true);
    try {
      await fetchClient(`/purchases/${purchaseId}/lens-grid`, {
        method: "POST",
        data: { productId: selectedProductId, locationId, lensGrid },
      });
      toast.success(`${activeCells} power combination(s) ingested. ${totalQty} units added to stock.`);
      setGridQty({});
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to ingest lens grid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Lens Power Grid — Purchase #{purchaseId}
          </DialogTitle>
          <DialogDescription>
            Enter quantities per SPH x CYL combination. Only cells with qty greater than 0 are ingested.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Lens Product *</Label>
              <select
                value={selectedProductId || ""}
                onChange={(e) => setSelectedProductId(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Select lens product —</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {products.length === 0 && (
                <p className="text-xs text-amber-600">No lens products found. Add a product in the Lenses category first.</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Receiving Location *</Label>
              <select
                value={locationId || ""}
                onChange={(e) => setLocationId(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Select location —</option>
                {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit Cost (Rs.)</Label>
              <Input
                type="number" min="0" step="0.01"
                value={defaultUnitCost || ""}
                onChange={(e) => setDefaultUnitCost(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 250.00"
                className="h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">SPH Range:</span>
            <select value={sphMin} onChange={(e) => setSphMin(e.target.value)} className="h-8 rounded border border-input bg-background px-2 text-xs">
              {SPH_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">to</span>
            <select value={sphMax} onChange={(e) => setSphMax(e.target.value)} className="h-8 rounded border border-input bg-background px-2 text-xs">
              {SPH_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-xs text-muted-foreground ml-auto">
              {activeCells} cell{activeCells !== 1 ? "s" : ""} filled · <strong>{totalQty}</strong> total units
            </span>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg shadow-inner">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="sticky left-0 z-20 bg-muted px-3 py-2 text-left font-bold border-b border-r border-border whitespace-nowrap text-muted-foreground">
                    SPH / CYL
                  </th>
                  {CYL_STEPS.map(cyl => (
                    <th key={cyl} className="px-2 py-2 font-semibold border-b border-border text-center whitespace-nowrap text-muted-foreground min-w-[54px]">
                      {cyl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleSphSteps.map((sph, si) => (
                  <tr key={sph} className={si % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                    <td className="sticky left-0 z-10 bg-inherit px-3 py-1.5 font-semibold border-r border-border whitespace-nowrap">
                      {sph}
                    </td>
                    {CYL_STEPS.map(cyl => {
                      const qty = getCell(sph, cyl);
                      return (
                        <td key={cyl} className="px-1 py-1">
                          <input
                            type="number"
                            min="0"
                            max="9999"
                            value={qty || ""}
                            onChange={(e) => setCell(sph, cyl, parseInt(e.target.value, 10) || 0)}
                            className={`w-12 h-7 rounded border text-center text-xs bg-background transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
                              qty > 0
                                ? "border-primary/60 font-bold text-primary"
                                : "border-input text-muted-foreground"
                            }`}
                            placeholder="·"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || totalQty === 0}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Grid3X3 className="h-4 w-4 mr-2" />}
            Ingest {totalQty > 0 ? `${totalQty} units (${activeCells} cells)` : "Grid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
