"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { DynamicFieldBuilder } from "@/components/custom-fields/DynamicFieldBuilder";
import { DynamicFieldPreview } from "@/components/custom-fields/DynamicFieldPreview";
import { CustomField } from "@/types/custom-field";
import { useRouter } from "next/navigation";
import { SettingsService } from "@/services/settings.service";
import { toast } from "sonner";

export default function NewCustomFieldPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Partial<CustomField>>({
    name: "",
    type: "TEXT",
    entityTarget: "PRODUCT"
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (newField: CustomField) => {
    setIsSaving(true);
    try {
      const currentSettings = await SettingsService.getSettings();
      const definitions = currentSettings.customFieldDefinitions || { products: [], customers: [] };
      
      if (newField.entityTarget === "PRODUCT") {
        definitions.products = [...(definitions.products || []), newField];
      } else {
        definitions.customers = [...(definitions.customers || []), newField];
      }
      
      await SettingsService.updateSettings({ customFieldDefinitions: definitions });
      toast.success("Custom field created successfully!");
      router.push("/custom-fields");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save custom field");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/custom-fields");
  };

  return (
    <PageContainer title="New Custom Field" description="Create a new dynamic attribute for your system.">
      <ProductHeader title="Field Configuration" />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        <div className="h-full relative">
          {isSaving && <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">Saving...</div>}
          <DynamicFieldBuilder 
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
