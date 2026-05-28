"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DynamicCustomerFieldRenderer } from "./DynamicCustomerFieldRenderer";
import { MOCK_CUSTOMER_FIELDS } from "@/lib/mock-customer-data";
import { Customer } from "@/types/customer";

const customerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

type CustomerValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer;
}

export function CustomerForm({ initialData }: CustomerFormProps) {
  const router = useRouter();
  
  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
      customFields: initialData?.customFields || {},
    },
  });

  const onSubmit = (values: CustomerValues) => {
    console.log("Mock customer submission:", values);
    router.push("/customers");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
          <Input {...form.register("fullName")} placeholder="John Doe" />
          {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone <span className="text-destructive">*</span></label>
          <Input {...form.register("phone")} placeholder="+1 555-0100" />
          {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input {...form.register("email")} type="email" placeholder="john@example.com" />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <Input {...form.register("address")} placeholder="123 Main St..." />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea {...form.register("notes")} placeholder="Special preferences or notes..." className="min-h-[80px]" />
      </div>

      {/* Dynamic Fields */}
      {MOCK_CUSTOMER_FIELDS.length > 0 && (
        <div>
          <h3 className="text-lg font-medium border-b border-border pb-2 mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CUSTOMER_FIELDS.map((field) => (
              <div key={field.id} className={field.type === "textarea" ? "md:col-span-3 space-y-2" : "space-y-2"}>
                {field.type !== "checkbox" && (
                  <label className="text-sm font-medium">
                    {field.name} {field.required && <span className="text-destructive">*</span>}
                  </label>
                )}
                <Controller
                  control={form.control}
                  name={`customFields.${field.id}`}
                  render={({ field: controllerField }) => (
                    <DynamicCustomerFieldRenderer 
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

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit">{initialData ? "Save Changes" : "Create Customer"}</Button>
      </div>
    </form>
  );
}
