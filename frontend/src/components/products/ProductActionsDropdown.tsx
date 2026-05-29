"use client";

import { ApiProduct } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, ArrowUpDown, Edit, Eye, PackagePlus } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SecureActionConfirm } from "@/components/shared/SecureActionConfirm";
import { RequireRole } from "@/components/auth/RequireRole";

interface ProductActionsDropdownProps {
  product: ApiProduct;
  onDelete?: (id: number) => void;
  onQuickStockUpdate?: (product: ApiProduct) => void;
}

export function ProductActionsDropdown({ product, onDelete, onQuickStockUpdate }: ProductActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit product
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onQuickStockUpdate?.(product)}>
            <PackagePlus className="mr-2 h-4 w-4" />
            Quick Stock Update
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <RequireRole allowedRoles={["ADMIN"]}>
            <SecureActionConfirm
              title="Delete Product?"
              description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
              onConfirm={() => onDelete?.(product.id)}
              actionLabel="Delete"
            >
              <DropdownMenuItem 
                className="text-destructive" 
                onSelect={(e: Event) => e.preventDefault()}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </SecureActionConfirm>
          </RequireRole>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
