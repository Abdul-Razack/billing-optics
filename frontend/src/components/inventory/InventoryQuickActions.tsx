import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageSearch, ArrowRightLeft, AlertTriangle, Download, PackagePlus } from "lucide-react";
import Link from "next/link";

export function InventoryQuickActions() {
  return (
    <Card className="shrink-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors" asChild>
          <Link href="/inventory/stock">
            <PackageSearch className="h-6 w-6" />
            <span className="text-sm">Manage Stock</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors" asChild>
          <Link href="/inventory/stock?status=low-stock">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-sm">Low Stock Alerts</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors" asChild>
          <Link href="/products/import">
            <PackagePlus className="h-6 w-6" />
            <span className="text-sm">Add / Import</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors" onClick={() => {
          // This will trigger the global export or route to products for export
          window.location.href = "/products";
        }}>
          <Download className="h-6 w-6" />
          <span className="text-sm">Export Inventory</span>
        </Button>
      </CardContent>
    </Card>
  );
}
