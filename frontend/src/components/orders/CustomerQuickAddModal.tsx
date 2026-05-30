import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle } from "lucide-react";
import { CustomerService } from "@/services/customer.service";
import { ApiCustomer } from "@/types/customer";
import { toast } from "sonner";

interface CustomerQuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customer: ApiCustomer) => void;
}

export function CustomerQuickAddModal({ open, onOpenChange, onSuccess }: CustomerQuickAddModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error("Name and Phone are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
      };
      
      if (formData.email && formData.email.trim() !== "") {
        payload.email = formData.email.trim();
      }
      
      const newCustomer = await CustomerService.createCustomer(payload);
      
      toast.success("Customer added successfully!");
      setFormData({ fullName: "", phone: "", email: "" });
      onSuccess(newCustomer);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to create customer", error);
      // Handle API validation errors which might come as an array or specific message
      const errorMessage = error.response?.data?.message || error.message || "Failed to create customer. Phone number might already exist.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(val) => {
        if (isSubmitting) return;
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Quick Add Customer
            </DialogTitle>
            <DialogDescription>
              Create a new customer profile for checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
              <Input 
                id="fullName" 
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input 
                id="phone" 
                placeholder="e.g. 555-0198"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
              <Input 
                id="email" 
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
