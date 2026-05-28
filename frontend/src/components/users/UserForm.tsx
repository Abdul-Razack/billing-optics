"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "CASHIER", "OPTOMETRIST"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

type UserValues = z.infer<typeof userSchema>;

export function UserForm({ initialData }: { initialData?: Partial<UserValues> }) {
  const router = useRouter();

  const form = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      role: initialData?.role || "CASHIER",
      status: initialData?.status || "ACTIVE",
    },
  });

  const onSubmit = (values: UserValues) => {
    console.log("Mock User Saved:", values);
    router.push("/users");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card rounded-lg border border-border shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
          <Input 
            placeholder="John Doe" 
            {...form.register("name")}
            className={form.formState.errors.name ? "border-destructive" : ""}
          />
          {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></label>
          <Input 
            type="email"
            placeholder="john@example.com" 
            {...form.register("email")}
            className={form.formState.errors.email ? "border-destructive" : ""}
          />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number</label>
          <Input 
            placeholder="+1 234 567 8900" 
            {...form.register("phone")}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">System Role <span className="text-destructive">*</span></label>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                  <SelectItem value="OPTOMETRIST">Optometrist</SelectItem>
                  <SelectItem value="CASHIER">Cashier (Billing Only)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      
      <div className="pt-4 pb-2 border-t border-b border-border my-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Account Status</h4>
            <p className="text-sm text-muted-foreground">Enable or disable user access to the system.</p>
          </div>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Switch 
                checked={field.value === "ACTIVE"} 
                onCheckedChange={(checked) => field.onChange(checked ? "ACTIVE" : "INACTIVE")} 
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          {initialData ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
