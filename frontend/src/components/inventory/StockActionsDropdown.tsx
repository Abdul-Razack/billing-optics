import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit3, History } from "lucide-react";
import { ApiProduct } from "@/services/product.service";
import Link from "next/link";

interface StockActionsDropdownProps {
  product: ApiProduct;
  onAdjustStock: (product: ApiProduct) => void;
}

export function StockActionsDropdown({ product, onAdjustStock }: StockActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link href={`/products/${product.id}`} className="cursor-pointer flex items-center">
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
            View Product
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdjustStock(product)} className="cursor-pointer flex items-center">
          <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" />
          Quick Adjust
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="cursor-not-allowed flex items-center">
          <History className="mr-2 h-4 w-4 text-muted-foreground" />
          Movement History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
