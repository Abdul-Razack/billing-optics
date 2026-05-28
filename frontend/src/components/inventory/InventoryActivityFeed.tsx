import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiProduct } from "@/services/product.service";
import { StockStatusBadge, StockStatus } from "@/components/products/StockStatusBadge";
import { calculateStockStatus } from "@/lib/stock";
import { Package, RefreshCw } from "lucide-react";

interface InventoryActivityFeedProps {
  products: ApiProduct[];
  isLoading: boolean;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "recently";
  
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + " seconds ago";
}

export function InventoryActivityFeed({ products, isLoading }: InventoryActivityFeedProps) {
  // Sort products by updatedAt descending
  const sortedProducts = [...products].sort((a, b) => {
    return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
  });

  const recentActivity = sortedProducts.slice(0, 10); // Show top 10 recent

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Recent Activity
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1">Inventory updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recentActivity.map(product => {
              const currentStock = (product as any).currentStock ?? 0;
              const { status } = calculateStockStatus(currentStock, product.minStockAlert);
              const agoText = timeAgo(product.updatedAt || product.createdAt);

              return (
                <div key={product.id} className="flex items-start space-x-4">
                  <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{agoText}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">
                        SKU: {product.sku} • Stock: {currentStock}
                      </p>
                      <StockStatusBadge status={status as StockStatus} />
                    </div>
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
