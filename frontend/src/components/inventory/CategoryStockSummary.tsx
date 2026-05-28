import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiProduct } from "@/services/product.service";
import { ApiCategory } from "@/services/category.service";
import { PieChart } from "lucide-react";

interface CategoryStockSummaryProps {
  products: ApiProduct[];
  categories: ApiCategory[];
  isLoading: boolean;
}

export function CategoryStockSummary({ products, categories, isLoading }: CategoryStockSummaryProps) {
  // Compute category breakdown
  const categoryStats = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    const totalStock = catProducts.reduce((sum, p) => sum + ((p as any).currentStock ?? 0), 0);
    const value = catProducts.reduce((sum, p) => sum + (((p as any).currentStock ?? 0) * (p.costPrice || 0)), 0);
    return {
      ...cat,
      productCount: catProducts.length,
      totalStock,
      value: value / 100 // Convert from cents
    };
  }).filter(stat => stat.productCount > 0)
    .sort((a, b) => b.totalStock - a.totalStock); // Sort by highest stock

  const totalGlobalStock = categoryStats.reduce((sum, cat) => sum + cat.totalStock, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-muted-foreground" />
          Stock by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : categoryStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PieChart className="h-10 w-10 text-muted/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No category data</p>
            <p className="text-xs text-muted-foreground mt-1">Assign categories to products to see the breakdown.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {categoryStats.map(stat => {
              const percentage = totalGlobalStock > 0 ? (stat.totalStock / totalGlobalStock) * 100 : 0;
              return (
                <div key={stat.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stat.name}</span>
                    <div className="flex gap-4 text-muted-foreground text-xs">
                      <span className="font-semibold text-foreground">{stat.totalStock} units</span>
                      <span className="w-16 text-right">${stat.value.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(percentage, 1)}%` }} // Give at least 1% for visibility if > 0
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
