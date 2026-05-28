"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductStatusBadge } from "@/components/products/ProductStatusBadge";

export default function CategoriesPage() {
  return (
    <PageContainer title="Categories" description="Manage product categories.">
      <ProductHeader title="Categories">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </ProductHeader>

      <ProductCard title="All Categories">
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CATEGORIES.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.description || "N/A"}</TableCell>
                  <TableCell>
                    <ProductStatusBadge type="active" isActive={cat.isActive} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ProductCard>
    </PageContainer>
  );
}
