"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CategoryService } from "@/services/category.service";
import { CategoryAttributesManager } from "@/components/categories/CategoryAttributesManager";

const categorySchema = z.object({
  name: z.string().min(1, "Category Name is required"),
  description: z.string().optional().nullable(),
  parentId: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: any; // ApiCategory
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    CategoryService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
      parentId: initialData?.parentId ? String(initialData.parentId) : "none",
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...values,
        description: values.description || undefined,
        parentId: values.parentId === "none" ? null : Number(values.parentId),
      };
      
      if (initialData) {
        await CategoryService.updateCategory(initialData.id, payload);
      } else {
        await CategoryService.createCategory(payload);
      }
      router.push("/categories");
      router.refresh(); 
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the category.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out self and children to prevent circular dependencies
  const availableParents = categories.filter(c => c.id !== initialData?.id);

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category</Label>
              <Controller
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top-level Category)</SelectItem>
                      {availableParents.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                {...form.register("description")} 
                className="resize-none"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Active categories can be assigned to products.
                </p>
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
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>

      {/* Render the attributes manager only if we are editing an existing category */}
      {initialData && (
        <CategoryAttributesManager 
          categoryId={initialData.id} 
          categoryName={initialData.name} 
        />
      )}
    </div>
  );
}
