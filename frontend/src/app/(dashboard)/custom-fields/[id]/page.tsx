"use client";

import { useState, useEffect, use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { DynamicFieldBuilder } from "@/components/custom-fields/DynamicFieldBuilder";
import { DynamicFieldPreview } from "@/components/custom-fields/DynamicFieldPreview";
import { CustomField } from "@/types/custom-field";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { SettingsService } from "@/services/settings.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditCustomFieldPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [existingField, setExistingField] = useState<CustomField | null>(null);
  const [config, setConfig] = useState<Partial<CustomField>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!resolvedParams.id || resolvedParams.id === "undefined") {
      notFound();
      return;
    }

    SettingsService.getSettings()
      .then(settings => {
        const definitions = settings.customFieldDefinitions || { products: [], customers: [] };
        const field = [...(definitions.products || []), ...(definitions.customers || [])]
          .find(f => f.id === resolvedParams.id);
        
        if (!field) {
          notFound();
        } else {
          setExistingField(field);
          setConfig(field);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleSave = async (updatedField: CustomField) => {
    setIsSaving(true);
    try {
      const currentSettings = await SettingsService.getSettings();
      const definitions = currentSettings.customFieldDefinitions || { products: [], customers: [] };
      
      // Remove from existing if it changed entities
      definitions.products = (definitions.products || []).filter(f => f.id !== updatedField.id);
      definitions.customers = (definitions.customers || []).filter(f => f.id !== updatedField.id);

      if (updatedField.entityTarget === "PRODUCT") {
        definitions.products.push(updatedField);
      } else {
        definitions.customers.push(updatedField);
      }
      
      await SettingsService.updateSettings({ customFieldDefinitions: definitions });
      toast.success("Custom field updated successfully!");
      router.push("/custom-fields");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update custom field");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/custom-fields");
  };

  if (loading) {
    return (
      <PageContainer title="Edit Custom Field" description="Loading field configuration...">
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!existingField) return null;

  return (
    <PageContainer title="Edit Custom Field" description={`Modifying configuration for ${existingField.name}.`}>
      <ProductHeader title="Field Configuration" />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        <div className="h-full relative">
          {isSaving && <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">Saving...</div>}
          <DynamicFieldBuilder 
            initialData={existingField}
            onConfigChange={setConfig} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        </div>
        <div className="h-full hidden xl:block">
          <DynamicFieldPreview fieldConfig={config} />
        </div>
      </div>
    </PageContainer>
  );
}
