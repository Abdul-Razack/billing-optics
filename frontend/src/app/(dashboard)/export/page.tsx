import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ExportConfigurator } from "@/components/bulk-operations/ExportConfigurator";

export default function BulkExportPage() {
  return (
    <PageContainer title="Export Data" description="Download system data as CSV or Excel files.">
      <ProductHeader title="Export Configurator" />
      <ExportConfigurator />
    </PageContainer>
  );
}
