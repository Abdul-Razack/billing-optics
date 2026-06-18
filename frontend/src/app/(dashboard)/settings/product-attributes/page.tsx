"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { useFetch } from "@/hooks/useApi";
import { fetchClient } from "@/lib/api-client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function ProductAttributesSettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newField, setNewField] = useState({ label: "", name: "", inputType: "SELECT", isRequired: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState("");
  const [addingOptionToId, setAddingOptionToId] = useState<number | null>(null);

  // Ideally, fetch categories from /api/categories
  const { data: categoriesResponse, isLoading: catsLoading } = useFetch<{ success: boolean, data: any[] }>("/categories");
  const categories = categoriesResponse?.data || [];

  // Fetch attributes for selected category
  const { data: attributesResponse, isLoading: attrsLoading } = useFetch<{ success: boolean, data: any[] }>(
    `/product-attributes/categories/${selectedCategory?.id || '0'}/attributes`,
    { enabled: !!selectedCategory }
  );
  const attributes = attributesResponse?.data || [];

  const handleCreateField = async () => {
    if (!newField.label || !newField.name) return toast.error("Label and Name are required");
    try {
      setIsSubmitting(true);
      await fetchClient("/product-attributes/attributes", {
        method: "POST",
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          ...newField
        })
      });
      toast.success("Field created successfully");
      setIsAddDialogOpen(false);
      setNewField({ label: "", name: "", inputType: "SELECT", isRequired: false });
      // In a real app we'd trigger a re-fetch, for now we can just reload or rely on mutate
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create field");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteField = async (id: number) => {
    if (!confirm("Are you sure you want to delete this field? This might affect existing products.")) return;
    try {
      await fetchClient(`/product-attributes/attributes/${id}`, {
        method: "DELETE",
      });
      toast.success("Field deleted");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete field");
    }
  };

  const handleAddOption = async (attributeId: number) => {
    if (!newOptionValue.trim()) return toast.error("Option value cannot be empty");
    try {
      await fetchClient(`/product-attributes/attributes/${attributeId}/options`, {
        method: "POST",
        body: JSON.stringify({ value: newOptionValue.trim() })
      });
      toast.success("Option added");
      setNewOptionValue("");
      setAddingOptionToId(null);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to add option");
    }
  };

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  return (
    <PageContainer 
      title="Product Master Lists" 
      description="Define the exact fields and dropdown options for each product category (Frames, Lenses, etc)."
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar for categories */}
        <div className="w-full md:w-64 space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground mb-4 uppercase tracking-wider">Categories</h3>
          {catsLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading categories...</div>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors border ${
                  selectedCategory?.id === cat.id 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card hover:bg-muted border-border text-foreground"
                }`}
              >
                <span className="font-medium">{cat.name}</span>
                <Settings2 className="h-4 w-4 opacity-50" />
              </button>
            ))
          )}
        </div>

        {/* Right side for Attributes */}
        <div className="flex-1">
          {selectedCategory ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{selectedCategory.name} Attributes</h2>
                  <p className="text-muted-foreground text-sm">Manage the dynamic fields for this category.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Field
                </Button>
              </div>

              {attrsLoading ? (
                <div className="p-8 text-center text-muted-foreground border rounded-lg bg-card">Loading attributes...</div>
              ) : attributes.length === 0 ? (
                <div className="p-12 text-center border border-dashed rounded-lg bg-muted/30">
                  <h3 className="text-lg font-medium mb-2">No fields defined</h3>
                  <p className="text-sm text-muted-foreground mb-4">You haven't defined any custom fields for {selectedCategory.name} yet.</p>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>Create First Field</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attributes.map((attr) => (
                    <Card key={attr.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{attr.label}</CardTitle>
                            <CardDescription className="text-xs font-mono mt-1">Key: {attr.name} • {attr.inputType}</CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteField(attr.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {attr.inputType === 'SELECT' ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-medium uppercase text-muted-foreground">Dropdown Options</h4>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                {attr.options?.length || 0} options
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {attr.options?.map((opt: any) => (
                                <span key={opt.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border">
                                  {opt.value}
                                </span>
                              ))}
                              {(!attr.options || attr.options.length === 0) && (
                                <span className="text-xs text-muted-foreground italic">No options defined yet.</span>
                              )}
                            </div>
                            
                            {addingOptionToId === attr.id ? (
                              <div className="flex items-center gap-2 mt-4">
                                <Input 
                                  className="h-8 text-xs" 
                                  placeholder="e.g. Titanium" 
                                  value={newOptionValue}
                                  onChange={(e) => setNewOptionValue(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddOption(attr.id)}
                                  autoFocus
                                />
                                <Button size="sm" className="h-8 text-xs px-2" onClick={() => handleAddOption(attr.id)}>Add</Button>
                                <Button size="sm" variant="ghost" className="h-8 text-xs px-2" onClick={() => setAddingOptionToId(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-4 text-xs h-8 border-dashed"
                                onClick={() => setAddingOptionToId(attr.id)}
                              >
                                <Plus className="mr-1 h-3 w-3" /> Add Option
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-md border border-dashed">
                            Standard {attr.inputType.toLowerCase()} input field.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-card text-muted-foreground">
              Select a category to view its attributes.
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Field to {selectedCategory?.name}</DialogTitle>
            <DialogDescription>Define a new dynamic attribute for this category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input 
                placeholder="e.g. Frame Color" 
                value={newField.label}
                onChange={(e) => {
                  const label = e.target.value;
                  const name = label.toLowerCase().replace(/[^a-z0-9]/g, '');
                  setNewField({...newField, label, name});
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Database Key (Auto-generated)</Label>
              <Input value={newField.name} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Input Type</Label>
              <Select value={newField.inputType} onValueChange={(val) => setNewField({...newField, inputType: val || "SELECT"})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELECT">Dropdown List (Select)</SelectItem>
                  <SelectItem value="TEXT">Short Text</SelectItem>
                  <SelectItem value="NUMBER">Number</SelectItem>
                  <SelectItem value="BOOLEAN">Checkbox (Yes/No)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Required Field</Label>
                <div className="text-sm text-muted-foreground">Is this field mandatory?</div>
              </div>
              <Switch checked={newField.isRequired} onCheckedChange={(checked) => setNewField({...newField, isRequired: checked})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateField} disabled={isSubmitting}>Save Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
