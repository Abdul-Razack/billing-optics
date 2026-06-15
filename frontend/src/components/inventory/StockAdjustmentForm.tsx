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
import { PackagePlus, AlertTriangle } from "lucide-react";
import { QuantityPreviewCard } from "./QuantityPreviewCard";
import { AdjustmentReasonSelector, ADJUSTMENT_REASONS } from "./AdjustmentReasonSelector";

type AdjustmentType = "add" | "reduce" | "replace";

interface StockAdjustmentFormProps {
  product: ApiProduct;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockAdjustmentForm({ product, isOpen, onClose, onSuccess }: StockAdjustmentFormProps) {
  const currentStock = (product as any).currentStock ?? 0;
  
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("add");
  const [quantityStr, setQuantityStr] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate new stock based on type and input
  const quantity = parseInt(quantityStr, 10) || 0;
  let newStock = currentStock;
  
  if (!isNaN(quantity) && quantityStr !== "") {
    if (adjustmentType === "add") newStock = currentStock + quantity;
    if (adjustmentType === "reduce") newStock = currentStock - quantity;
    if (adjustmentType === "replace") newStock = quantity;
  }

  const isValid = quantity > 0 && newStock >= 0 && reason !== "";

  const handleProceed = () => {
    if (!isValid) {
      toast.error("Please ensure all required fields are valid.");
      return;
    }
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let adjType: "IN" | "OUT" | "ADJUSTMENT" = "ADJUSTMENT";
      let deltaQuantity = quantity;

      if (adjustmentType === "add") {
        adjType = "IN";
      } else if (adjustmentType === "reduce") {
        adjType = "OUT";
      } else if (adjustmentType === "replace") {
        adjType = "ADJUSTMENT";
        deltaQuantity = newStock - currentStock;
      }

      if (deltaQuantity === 0) {
        toast.error("Adjustment results in no change to stock.");
        setIsSubmitting(false);
        return;
      }

      const selectedReason = ADJUSTMENT_REASONS.find(r => r.value === reason)?.label || reason;
      const combinedNotes = selectedReason ? `${selectedReason}${notes ? ` - ${notes}` : ""}` : notes;

      await InventoryService.adjustStock({
        productId: product.id,
        adjustmentType: adjType,
        quantity: deltaQuantity,
        notes: combinedNotes
      });
      
      toast.success("Stock adjusted successfully!");
      setShowConfirmation(false);
      onSuccess();
      onClose();
      
      // Reset form
      setQuantityStr("");
      setReason("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply stock adjustment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    const selectedReason = ADJUSTMENT_REASONS.find(r => r.value === reason)?.label;
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Stock Adjustment
            </DialogTitle>
            <DialogDescription>
              Please review the adjustment details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-medium text-foreground">{product.name} <span className="text-muted-foreground text-xs font-normal">({product.sku})</span></p>
            </div>
            
            <QuantityPreviewCard 
              currentStock={currentStock} 
              newStock={newStock} 
              adjustmentType={adjustmentType} 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm font-medium">{selectedReason}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium capitalize">{adjustmentType} Stock</p>
              </div>
            </div>
            
            {notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm italic">{notes}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isSubmitting}>
              Back to Edit
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Confirming..." : "Confirm Adjustment"}
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
            <PackagePlus className="h-5 w-5 text-primary" />
            Adjust Stock Level
          </DialogTitle>
          <DialogDescription>
            Update inventory for <strong className="text-foreground">{product.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 space-y-5">
          <QuantityPreviewCard 
            currentStock={currentStock} 
            newStock={newStock} 
            adjustmentType={adjustmentType} 
          />

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
              <Label>Quantity</Label>
              <Input 
                type="NUMBER" 
                min="1"
                placeholder="e.g. 10" 
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
              />
              {newStock < 0 && (
                <p className="text-xs text-destructive">Resulting stock cannot be negative.</p>
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
              placeholder="Provide any additional context here..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleProceed} disabled={!isValid}>
            Review Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
