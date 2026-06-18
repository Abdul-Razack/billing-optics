"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
import { useFetch } from "@/hooks/useApi";
import { locationService } from "@/services/location.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function LocationsSettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    contactNumber: "",
    isActive: true
  });

  const { data: response, isLoading, error, refetch } = useFetch<{ success: boolean; data: { data: any[] } }>("/locations");
  const locations = response?.data?.data || [];

  const handleOpenDialog = (location?: any) => {
    if (location) {
      setEditingId(location.id);
      setFormData({
        name: location.name,
        code: location.code,
        address: location.address || "",
        contactNumber: location.contactNumber || "",
        isActive: location.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        code: "",
        address: "",
        contactNumber: "",
        isActive: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      return toast.error("Branch Name and Code are required.");
    }
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        await locationService.updateLocation(editingId, formData);
        toast.success("Branch updated successfully");
      } else {
        await locationService.createLocation(formData);
        toast.success("Branch created successfully");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      await locationService.deleteLocation(id);
      toast.success("Branch deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete branch");
    }
  };

  return (
    <PageContainer 
      title="Branches & Locations" 
      description="Manage the physical store branches or warehouses for your business."
      action={
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Branch
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
          <CardDescription>
            You can create multiple branches and switch between them during billing and inventory management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">Loading branches...</TableCell>
                  </TableRow>
                ) : locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Building2 className="h-8 w-8 opacity-20" />
                        <p>No branches found. Add your first store location to get started.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.code}</TableCell>
                      <TableCell>{location.name}</TableCell>
                      <TableCell>{location.contactNumber || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{location.address || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={location.isActive ? "default" : "secondary"}>
                          {location.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(location)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* Optionally disable delete if it's the only active branch */}
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(location.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Branch" : "Add New Branch"}</DialogTitle>
            <DialogDescription>
              A unique branch code helps identify the store in reports and invoices.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">Branch Code</Label>
              <Input
                id="code"
                placeholder="e.g. HQ, STORE01"
                className="col-span-3"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Store Name</Label>
              <Input
                id="name"
                placeholder="e.g. Downtown Main Store"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactNumber" className="text-right">Phone</Label>
              <Input
                id="contactNumber"
                placeholder="Branch contact number"
                className="col-span-3"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="address" className="text-right pt-2">Address</Label>
              <Input
                id="address"
                placeholder="Full address of the branch"
                className="col-span-3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label htmlFor="isActive" className="text-right">Status</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="font-normal">
                  {formData.isActive ? "Active (Can be selected for billing)" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
