import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, PackagePlus, CheckCircle, ShoppingCart } from "lucide-react";
import { ApiProduct } from "@/services/product.service";
import Link from "next/link";

interface AlertActionDropdownProps {
  product: ApiProduct;
  onAdjustStock: (product: ApiProduct) => void;
  onMarkReviewed: (product: ApiProduct) => void;
}

export function AlertActionDropdown({ product, onAdjustStock, onMarkReviewed }: AlertActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem asChild>
          <Link href={`/products/${product.id}`} className="cursor-pointer flex items-center">
            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
            View Product
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdjustStock(product)} className="cursor-pointer flex items-center">
          <PackagePlus className="mr-2 h-4 w-4 text-muted-foreground" />
          Restock / Adjust
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/purchases/new?productId=${product.id}`} className="cursor-pointer flex items-center">
            <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
            Create Purchase Order
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onMarkReviewed(product)} className="cursor-pointer flex items-center">
          <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
          Mark Reviewed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
