import { ReportCard } from "@/components/reports/ReportCard";
import { Grid, DollarSign, Package, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CategoryOverviewCardsProps {
  data: {
    totalCategories: number;
    activeCategories: number;
    totalRevenue: number;
    totalInventoryValue: number;
    topCategory: string;
    topCategoryRevenue: number;
  };
}

export function CategoryOverviewCards({ data }: CategoryOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ReportCard
        title="Total Categories"
        value={data.totalCategories.toString()}
        icon={Grid}
        description={`${data.activeCategories} Active`}
      />
      <ReportCard
        title="Category Revenue"
        value={formatCurrency(data.totalRevenue)}
        icon={DollarSign}
      />
      <ReportCard
        title="Top Category"
        value={data.topCategory}
        icon={TrendingUp}
        description={formatCurrency(data.topCategoryRevenue)}
      />
      <ReportCard
        title="Inventory Value"
        value={formatCurrency(data.totalInventoryValue)}
        icon={Package}
      />
    </div>
  );
}
