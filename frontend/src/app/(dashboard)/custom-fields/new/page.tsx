"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { DynamicFieldBuilder } from "@/components/custom-fields/DynamicFieldBuilder";
import { DynamicFieldPreview } from "@/components/custom-fields/DynamicFieldPreview";
import { CustomField } from "@/types/custom-field";
import { useRouter } from "next/navigation";

export default function NewCustomFieldPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Partial<CustomField>>({
    name: "",
    type: "TEXT",
    entityTarget: "PRODUCT"
  });

  const handleSave = () => {
    router.push("/custom-fields");
  };

  const handleCancel = () => {
    router.push("/custom-fields");
  };

  return (
    <PageContainer title="New Custom Field" description="Create a new dynamic attribute for your system.">
      <ProductHeader title="Field Configuration" />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        <div className="h-full">
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
