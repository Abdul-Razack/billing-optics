"use client";

import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ApiCategory } from "@/services/category.service";
import { TableSkeleton } from "@/components/shared/LoadingSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { FolderTree, MoreHorizontal, Search, Trash, Pencil } from "lucide-react";
import { ProductStatusBadge } from "@/components/products/ProductStatusBadge";
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

interface CategoryTableProps {
  data: ApiCategory[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
  className?: string;
}

function CategoryActionsCell({ category, onDelete }: { category: ApiCategory, onDelete?: (id: number) => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setTimeout(() => setShowDeleteDialog(true), 50);
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
            <DropdownMenuSeparator />
            <RequireRole allowedRoles={["ADMIN", "CASHIER"]}>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/categories/${category.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
            </RequireRole>
            <RequireRole allowedRoles={["ADMIN"]}>
              <DropdownMenuItem 
                variant="destructive"
                className="cursor-pointer" 
                onClick={handleDeleteClick}
                disabled={(category.productCount ?? 0) > 0}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete {(category.productCount ?? 0) > 0 ? `(${category.productCount})` : ""}
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
              {(category.productCount ?? 0) > 0 ? "Cannot Delete Category" : "Delete Category?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(category.productCount ?? 0) > 0 ? (
                <span>
                  &quot;{category.name}&quot; has <strong>{category.productCount}</strong> active product(s) assigned to it. You must reassign or remove those products before deleting this category.
                </span>
              ) : (
                <span>
                  Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {(category.productCount ?? 0) === 0 && (
              <AlertDialogAction 
                onClick={() => {
                  onDelete?.(category.id);
                  setShowDeleteDialog(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function CategoryTable({
  data,
  isLoading = false,
  onDelete,
  className
}: CategoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<ApiCategory>[]>(() => [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.getValue("name")}</div>
      )
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => {
        const count = row.original.productCount ?? 0;
        return (
          <Badge variant={count > 0 ? "secondary" : "outline"} className="font-mono text-xs">
            {count} {count === 1 ? "product" : "products"}
          </Badge>
        );
      }
    },
    {
      accessorKey: "parentId",
      header: "Parent Category",
      cell: ({ row }) => {
        const parentId = row.getValue<number>("parentId");
        if (!parentId) return <span className="text-muted-foreground">-</span>;
        const parent = data.find(c => c.id === parentId);
        return <Badge variant="outline">{parent?.name || "Unknown"}</Badge>;
      }
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue<string>("description");
        return <div className="text-muted-foreground truncate max-w-[300px]">{desc || "N/A"}</div>;
      }
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <ProductStatusBadge type="active" isActive={row.getValue("isActive")} />
    },
    {
      id: "actions",
      cell: ({ row }) => <CategoryActionsCell category={row.original} onDelete={onDelete} />,
    },
  ], [onDelete, data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 w-[250px] lg:w-[300px]"
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : data.length === 0 ? (
        <EmptyState 
          icon={FolderTree}
          title="No Categories Found"
          description="You don't have any categories yet or none match your search."
          actionLabel="Add Category"
          actionHref="/categories/new"
        />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} categories.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
