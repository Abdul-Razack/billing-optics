import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ImportWizard } from "@/components/bulk-operations/ImportWizard";

export default function BulkImportPage() {
  return (
    <PageContainer title="Bulk Import Data" description="Upload CSV or Excel files to bulk create or update records.">
      <ProductHeader title="Import Wizard" />
      <ImportWizard />
    </PageContainer>
  );
}
