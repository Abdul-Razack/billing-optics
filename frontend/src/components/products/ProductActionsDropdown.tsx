"use client";

import { ApiProduct } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, Edit, Eye, PackagePlus } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";
import { RequireRole } from "@/components/auth/RequireRole";
import { useState } from "react";

interface ProductActionsDropdownProps {
  product: ApiProduct;
  onDelete?: (id: number) => void;
  onQuickStockUpdate?: (product: ApiProduct) => void;
}

export function ProductActionsDropdown({ product, onDelete, onQuickStockUpdate }: ProductActionsDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    // Small delay so dropdown fully closes before dialog opens
    setTimeout(() => setShowDeleteDialog(true), 50);
  };

  const handleQuickStock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    onQuickStockUpdate?.(product);
  };

  return (
    <div data-no-row-click onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
              <Link href={`/products/${product.id}`} onClick={(e) => e.stopPropagation()}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/products/${product.id}/edit`} onClick={(e) => e.stopPropagation()}>
                <Edit className="mr-2 h-4 w-4" />
                Edit product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleQuickStock}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Quick Stock Update
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <RequireRole allowedRoles={["ADMIN"]}>
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDeleteClick}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </RequireRole>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(product.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
