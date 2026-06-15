"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { Offer, OfferType } from "@/types/offer";
import { OfferService } from "@/services/offer.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Edit2, Loader2, Save } from "lucide-react";
import { format } from "date-fns";

export function OffersSettings() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const data = await OfferService.getOffers();
      setOffers(data);
    } catch (error) {
      toast.error("Failed to fetch offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSave = async () => {
    if (!editingOffer || !editingOffer.name || !editingOffer.type || editingOffer.value === undefined) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingOffer.id) {
        await OfferService.updateOffer(editingOffer.id, editingOffer as any);
        toast.success("Offer updated successfully");
      } else {
        await OfferService.createOffer(editingOffer as any);
        toast.success("Offer created successfully");
      }
      setEditingOffer(null);
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message || "Failed to save offer");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await OfferService.deleteOffer(id);
      toast.success("Offer deleted");
      fetchOffers();
    } catch (error: any) {
      toast.error("Failed to delete offer");
    }
  };

  const formatCurrency = (amount: number) => `₹${(amount / 100).toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SettingsSection 
      title="Offers & Promotions" 
      description="Manage automated discounts and offers available during checkout."
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button 
            onClick={() => setEditingOffer({ type: 'PERCENTAGE', isActive: true, minOrderValue: 0 })}
            disabled={!!editingOffer}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </div>

        {editingOffer && (
          <div className="bg-muted/50 p-6 rounded-lg border border-border space-y-4">
            <h4 className="font-medium">{editingOffer.id ? "Edit Offer" : "New Offer"}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Offer Name</Label>
                <Input 
                  value={editingOffer.name || ""} 
                  onChange={e => setEditingOffer({ ...editingOffer, name: e.target.value })}
                  placeholder="e.g. Summer Sale"
                />
              </div>
              <div className="space-y-2">
                <Label>Coupon Code (Optional)</Label>
                <Input 
                  value={editingOffer.code || ""} 
                  onChange={e => setEditingOffer({ ...editingOffer, code: e.target.value })}
                  placeholder="e.g. SUMMER20"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select 
                  value={editingOffer.type} 
                  onValueChange={(val) => setEditingOffer({ ...editingOffer, type: (val as OfferType) || 'PERCENTAGE' })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FLAT_AMOUNT">Flat Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value {editingOffer.type === 'FLAT_AMOUNT' ? '(in paise)' : '(%)'}</Label>
                <Input 
                  type="number"
                  value={editingOffer.value || ""} 
                  onChange={e => setEditingOffer({ ...editingOffer, value: parseInt(e.target.value) || 0 })}
                  placeholder={editingOffer.type === 'PERCENTAGE' ? "20" : "50000"}
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Order Value (in paise)</Label>
                <Input 
                  type="number"
                  value={editingOffer.minOrderValue || ""} 
                  onChange={e => setEditingOffer({ ...editingOffer, minOrderValue: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center space-x-2 h-10">
                  <Switch 
                    checked={editingOffer.isActive !== false} 
                    onCheckedChange={c => setEditingOffer({ ...editingOffer, isActive: c })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="ghost" onClick={() => setEditingOffer(null)}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Offer
              </Button>
            </div>
          </div>
        )}

        <div className="border rounded-md divide-y">
          {offers.length === 0 && !editingOffer && (
            <div className="p-8 text-center text-muted-foreground">
              No offers configured yet.
            </div>
          )}
          {offers.map(offer => (
            <div key={offer.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
              <div>
                <div className="font-medium flex items-center space-x-2">
                  <span>{offer.name}</span>
                  {!offer.isActive && <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">Inactive</span>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {offer.type === 'PERCENTAGE' ? `${offer.value}% off` : `${formatCurrency(offer.value)} off`}
                  {offer.minOrderValue > 0 && ` on orders above ${formatCurrency(offer.minOrderValue)}`}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingOffer(offer)}>
                  <Edit2 className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsSection>
  );
}
