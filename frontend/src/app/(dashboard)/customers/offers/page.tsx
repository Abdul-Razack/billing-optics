"use client";

import { useState, useEffect } from "react";
import { Offer, OfferType } from "@/types/offer";
import { OfferService } from "@/services/offer.service";
import { ProductService, ApiProduct } from "@/services/product.service";
import { CategoryService, ApiCategory } from "@/services/category.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit2, Loader2, Save, Tag } from "lucide-react";
import { format } from "date-fns";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);

  const fetchOffers = async () => {
    try {
      const [offersData, productsData, categoriesData] = await Promise.all([
        OfferService.getOffers(),
        ProductService.getProducts(),
        CategoryService.getCategories()
      ]);
      setOffers(offersData);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      toast.error("Failed to fetch offers");
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Offers & Coupons</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage store discounts, promotions, and coupon codes applied during checkout.
          </p>
        </div>
        <Button 
          onClick={() => setEditingOffer({ type: 'PERCENTAGE', isActive: true, minOrderValue: 0 })}
          disabled={!!editingOffer}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {editingOffer && (
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {editingOffer.id ? "Edit Offer" : "New Offer"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
              
              <div className="space-y-2 md:col-span-2">
                <Label>Applicable Products</Label>
                <MultiSelect
                  options={products.map(p => ({ label: `${p.name} (${p.sku || 'No SKU'})`, value: p.id.toString() }))}
                  selected={(editingOffer.applicableProducts || []).map(id => id.toString())}
                  onChange={(selected) => {
                    setEditingOffer({ ...editingOffer, applicableProducts: selected.map(id => parseInt(id)) });
                  }}
                  placeholder="Select products..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Applicable Categories</Label>
                <MultiSelect
                  options={categories.map(c => ({ label: c.name, value: c.id.toString() }))}
                  selected={(editingOffer.applicableCategories || []).map(id => id.toString())}
                  onChange={(selected) => {
                    setEditingOffer({ ...editingOffer, applicableCategories: selected.map(id => parseInt(id)) });
                  }}
                  placeholder="Select categories..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-6">
              <Button variant="ghost" onClick={() => setEditingOffer(null)}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Offer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {offers.length === 0 && !editingOffer && (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Tag className="h-8 w-8 mb-3 opacity-20" />
                <p>No active offers found.</p>
                <Button variant="link" onClick={() => setEditingOffer({ type: 'PERCENTAGE', isActive: true, minOrderValue: 0 })}>
                  Create your first offer
                </Button>
              </div>
            )}
            {offers.map(offer => (
              <div key={offer.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-1">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {offer.name}
                      {!offer.isActive ? (
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold text-muted-foreground">Inactive</Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Active</Badge>
                      )}
                      {offer.code && (
                        <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                          CODE: {offer.code}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {offer.type === 'PERCENTAGE' ? `${offer.value}% OFF` : `${formatCurrency(offer.value)} OFF`}
                      </span>
                      {offer.minOrderValue > 0 && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span>Min order {formatCurrency(offer.minOrderValue)}</span>
                        </>
                      )}
                      {((offer.applicableProducts?.length || 0) > 0 || (offer.applicableCategories?.length || 0) > 0) && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span>Restricted applicability</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 shrink-0 ml-12 sm:ml-0">
                  <Button variant="outline" size="sm" onClick={() => setEditingOffer(offer)}>
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(offer.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
