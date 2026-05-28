"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { DynamicFieldBuilder } from "@/components/custom-fields/DynamicFieldBuilder";
import { DynamicFieldPreview } from "@/components/custom-fields/DynamicFieldPreview";
import { CustomField } from "@/types/custom-field";
import { MOCK_CUSTOM_FIELDS } from "@/lib/mock-custom-field-data";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditCustomFieldPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const existingField = MOCK_CUSTOM_FIELDS.find(f => f.id === params.id);
  
  if (!existingField) {
    notFound();
  }

  const [config, setConfig] = useState<Partial<CustomField>>(existingField);

  const handleSave = () => {
    router.push("/custom-fields");
  };

  const handleCancel = () => {
    router.push("/custom-fields");
  };

  return (
    <PageContainer title="Edit Custom Field" description={`Modifying configuration for ${existingField.name}.`}>
      <ProductHeader title="Field Configuration" />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        <div className="h-full">
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
