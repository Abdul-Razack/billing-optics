"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, PackagePlus } from "lucide-react";
import Link from "next/link";
import { ProductStatusBadge } from "./ProductStatusBadge";

interface ProductProfileHeaderProps {
  productId: number;
  name: string;
  isActive: boolean;
  onDelete: () => void;
  onQuickStockUpdate: () => void;
}

export function ProductProfileHeader({ 
  productId, 
  name, 
  isActive, 
  onDelete, 
  onQuickStockUpdate 
}: ProductProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{name}</h1>
            <ProductStatusBadge type="active" isActive={isActive} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Product Profile Overview
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onQuickStockUpdate}>
          <PackagePlus className="mr-2 h-4 w-4" />
          Update Stock
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/products/${productId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
