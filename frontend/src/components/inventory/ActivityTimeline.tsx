import { MOCK_INVENTORY_TRANSACTIONS } from "@/lib/mock-inventory-data";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { ArrowUpRight, ArrowDownRight, RefreshCw, FileEdit } from "lucide-react";

export function ActivityTimeline() {
  const transactions = MOCK_INVENTORY_TRANSACTIONS.slice(0, 5); // Show latest 5

  const getIcon = (type: string) => {
    switch(type) {
      case "PURCHASE": return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      case "SALE": return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case "RETURN": return <RefreshCw className="h-4 w-4 text-purple-600" />;
      case "ADJUSTMENT": return <FileEdit className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-6">
      <h3 className="font-medium text-foreground mb-6">Recent Stock Activity</h3>
      <div className="space-y-6">
        {transactions.map((txn, index) => {
          const product = MOCK_PRODUCTS.find(p => p.id === txn.productId);
          return (
            <div key={txn.id} className="relative flex gap-4">
              {/* Timeline connector line */}
              {index !== transactions.length - 1 && (
                <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-border" />
              )}
              
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                {getIcon(txn.type)}
              </div>
              
              <div className="flex flex-col flex-1 pb-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {product?.name || "Unknown Product"}
                  </p>
                  <TransactionTypeBadge type={txn.type} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground">
                    {txn.quantity > 0 ? "+" : ""}{txn.quantity} units {txn.referenceId ? `(Ref: ${txn.referenceId})` : ""}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(txn.date).toLocaleDateString()}
                  </span>
                </div>
                {txn.notes && (
                  <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                    {txn.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
