"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiCustomer } from "@/types/customer";
import { CustomField } from "@/types/product";
import { CustomerService } from "@/services/customer.service";
import { SettingsService } from "@/services/settings.service";
import { DynamicFieldRenderer } from "@/components/products/DynamicFieldRenderer";
import { buildDynamicSchema } from "@/lib/dynamic-schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const baseCustomerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  customFields: z.record(z.any()).optional(),
});

interface CustomerFormInnerProps {
  initialData?: ApiCustomer;
  customFields: CustomField[];
}

function CustomerFormInner({ initialData, customFields }: CustomerFormInnerProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditMode = !!initialData;
  const dynamicSchema = buildDynamicSchema(baseCustomerSchema, customFields);
  type DynamicCustomerValues = z.infer<typeof dynamicSchema>;

  const form = useForm<DynamicCustomerValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
      isActive: initialData?.isActive ?? true,
      customFields: initialData?.customFields || {},
    },
  });

  const onSubmit = async (values: DynamicCustomerValues) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {
        name: values.fullName.trim(),
        phone: values.phone.trim(),
        isActive: values.isActive,
        customFields: values.customFields || {},
      };

      if (values.email && values.email.trim() !== "") {
        payload.email = values.email.trim();
      }
      
      if (values.address && values.address.trim() !== "") {
        payload.address = values.address.trim();
      }
      
      if (values.notes && values.notes.trim() !== "") {
        payload.notes = values.notes.trim();
      }

      if (isEditMode && initialData) {
        await CustomerService.updateCustomer(initialData.id, payload);
      } else {
        await CustomerService.createCustomer(payload);
      }
      router.push("/customers");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Full Name <span className="text-destructive">*</span></Label>
          <Input {...form.register("fullName")} placeholder="John Doe" />
          {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label>Phone <span className="text-destructive">*</span></Label>
          <Input {...form.register("phone")} placeholder="+1 555-0100" />
          {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input {...form.register("email")} type="email" placeholder="john@example.com" />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input {...form.register("address")} placeholder="123 Main St..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea {...form.register("notes")} placeholder="Special preferences or notes..." className="min-h-[80px]" />
      </div>

      {/* Dynamic Fields */}
      {customFields.length > 0 && (
        <div>
          <h3 className="text-lg font-medium border-b border-border pb-2 mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customFields.map((field) => (
              <div key={field.id} className={field.type === "textarea" ? "md:col-span-3 space-y-2" : "space-y-2"}>
                {field.type !== "checkbox" && (
                  <Label>
                    {field.name} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                )}
                <Controller
                  control={form.control}
                  name={`customFields.${field.id}` as any}
                  render={({ field: controllerField }) => (
                    <DynamicFieldRenderer 
                      fieldDef={field}
                      value={controllerField.value}
                      onChange={controllerField.onChange}
                    />
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
        <div className="space-y-0.5">
          <Label>Active Status</Label>
          <p className="text-xs text-muted-foreground">Inactive customers will not be available for new transactions.</p>
        </div>
        <Controller
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}

export interface CustomerFormProps {
  initialData?: ApiCustomer;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const settingsData = await SettingsService.getSettings();
        setCustomFields(settingsData.customFieldDefinitions?.customers || []);
      } catch (err) {
        console.error("Failed to load custom fields", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFields();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <CustomerFormInner initialData={initialData} customFields={customFields} />;
}
