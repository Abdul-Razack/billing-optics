"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { UserService } from "@/services/user.service";
import { toast } from "sonner";

const userSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "CASHIER", "OPTOMETRIST"]),
  isActive: z.boolean(),
});

type UserValues = z.infer<typeof userSchema>;

export function UserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdStr = searchParams.get("edit");
  const editId = editIdStr ? parseInt(editIdStr, 10) : null;
  
  const [isLoading, setIsLoading] = useState(editId !== null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "CASHIER",
      isActive: true,
    },
  });

  useEffect(() => {
    let isMounted = true;
    if (editId) {
      UserService.getById(editId).then(user => {
        if (isMounted) {
          form.reset({
            fullName: user.fullName,
            email: user.email,
            password: "",
            role: user.role,
            isActive: user.isActive,
          });
          setIsLoading(false);
        }
      }).catch(err => {
        if (isMounted) {
          toast.error("Failed to load user details");
          setIsLoading(false);
        }
      });
    }
    return () => { isMounted = false; };
  }, [editId, form]);

  const onSubmit = async (values: UserValues) => {
    setIsSaving(true);
    try {
      if (editId) {
        if (!values.password) {
          delete values.password;
        }
        await UserService.update(editId, values);
        toast.success("User updated successfully");
      } else {
        if (!values.password) {
          toast.error("Password is required for new users");
          setIsSaving(false);
          return;
        }
        await UserService.create(values);
        toast.success("User created successfully");
      }
      router.push("/users");
    } catch (error: any) {
      toast.error(error.message || "Failed to save user");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card rounded-lg border border-border shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
          <Input 
            placeholder="John Doe" 
            {...form.register("fullName")}
            className={form.formState.errors.fullName ? "border-destructive" : ""}
          />
          {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
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
          <label className="text-sm font-medium">Password {editId ? "(Leave empty to keep current)" : "<span className=\"text-destructive\">*</span>"}</label>
          <Input 
            type="password"
            placeholder="********" 
            {...form.register("password")}
          />
          {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
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
            name="isActive"
            render={({ field }) => (
              <Switch 
                checked={field.value} 
                onCheckedChange={field.onChange} 
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {editId ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
