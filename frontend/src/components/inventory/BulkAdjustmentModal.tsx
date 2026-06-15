import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiProduct, ProductService } from "@/services/product.service";
import { InventoryService } from "@/services/inventory.service";
import { toast } from "sonner";
import { PackagePlus, AlertTriangle, Layers, Loader2 } from "lucide-react";
import { AdjustmentReasonSelector, ADJUSTMENT_REASONS } from "./AdjustmentReasonSelector";

type AdjustmentType = "add" | "reduce" | "replace";

interface BulkAdjustmentModalProps {
  products: ApiProduct[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkAdjustmentModal({ products, isOpen, onClose, onSuccess }: BulkAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("add");
  const [quantityStr, setQuantityStr] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const quantity = parseInt(quantityStr, 10) || 0;
  
  // Calculate projected changes
  const projections = products.map(product => {
    const current = (product as any).currentStock ?? 0;
    let newStock = current;
    
    if (!isNaN(quantity) && quantityStr !== "") {
      if (adjustmentType === "add") newStock = current + quantity;
      if (adjustmentType === "reduce") newStock = current - quantity;
      if (adjustmentType === "replace") newStock = quantity;
    }
    
    return {
      product,
      current,
      newStock,
      isNegative: newStock < 0
    };
  });

  const hasNegatives = projections.some(p => p.isNegative);
  const isValid = quantity > 0 && reason !== "" && !hasNegatives;

  const handleProceed = () => {
    if (!isValid) {
      if (hasNegatives) toast.error("Adjustment results in negative stock for some items.");
      else toast.error("Please fill in all required fields.");
      return;
    }
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setProgress(50); // visual indicator since it's one fast API call now
    
    try {
      const selectedReason = ADJUSTMENT_REASONS.find(r => r.value === reason)?.label || reason;
      const combinedNotes = selectedReason ? `${selectedReason}${notes ? ` - ${notes}` : ""}` : notes;

      const adjustments = projections.map(proj => {
        let adjType: "IN" | "OUT" | "ADJUSTMENT" = "ADJUSTMENT";
        let deltaQuantity = quantity;

        if (adjustmentType === "add") {
          adjType = "IN";
        } else if (adjustmentType === "reduce") {
          adjType = "OUT";
        } else if (adjustmentType === "replace") {
          adjType = "ADJUSTMENT";
          deltaQuantity = proj.newStock - proj.current;
        }

        return {
          productId: proj.product.id,
          adjustmentType: adjType,
          quantity: deltaQuantity,
          notes: combinedNotes
        };
      }).filter(a => a.quantity !== 0); // Remove no-op adjustments

      if (adjustments.length === 0) {
        toast.error("Adjustments result in no change to any stock.");
        setIsSubmitting(false);
        setProgress(0);
        return;
      }

      const result = await InventoryService.bulkAdjustStock({ adjustments });
      
      setProgress(100);
      
      if (result.failedCount === 0) {
        toast.success(`Successfully adjusted stock for ${result.successCount} products.`);
      } else {
        toast.warning(`Adjusted ${result.successCount} products, but ${result.failedCount} failed.`);
      }

      setShowConfirmation(false);
      onSuccess();
      onClose();
      
      // Reset form
      setQuantityStr("");
      setReason("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred during bulk update.");
      setProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    const selectedReason = ADJUSTMENT_REASONS.find(r => r.value === reason)?.label;
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Bulk Adjustment
            </DialogTitle>
            <DialogDescription>
              You are about to modify stock for <strong>{products.length} products</strong> simultaneously.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md border border-border">
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm font-medium">{selectedReason}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium capitalize">{adjustmentType} Stock</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Impact Preview</p>
              <div className="h-[200px] border rounded-md p-2 overflow-y-auto">
                <div className="space-y-2">
                  {projections.map((proj, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1 border-b last:border-0 border-border">
                      <span className="truncate pr-4 flex-1">{proj.product.name}</span>
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <span className="text-muted-foreground">{proj.current}</span>
                        <span className="text-muted-foreground text-xs">→</span>
                        <span className="font-bold text-foreground">{proj.newStock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isSubmitting}>
              Back to Edit
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress}%
                </>
              ) : (
                "Confirm Bulk Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Bulk Stock Adjustment
          </DialogTitle>
          <DialogDescription>
            Applying changes to <strong>{products.length}</strong> selected products.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select value={adjustmentType} onValueChange={(v: AdjustmentType | null) => { if (v) setAdjustmentType(v) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock (+)</SelectItem>
                  <SelectItem value="reduce">Reduce Stock (-)</SelectItem>
                  <SelectItem value="replace">Replace Quantity (=)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Quantity to Apply</Label>
              <Input 
                type="NUMBER" 
                min="1"
                placeholder="e.g. 10" 
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
              />
              {hasNegatives && (
                <p className="text-xs text-destructive">Some items will fall below 0 stock.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason for Adjustment <span className="text-destructive">*</span></Label>
            <AdjustmentReasonSelector value={reason} onChange={setReason} />
          </div>

          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea 
              placeholder="Provide context for this bulk operation..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleProceed} disabled={!isValid}>
            Review Impact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
