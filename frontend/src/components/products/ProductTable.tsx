"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ApiProduct } from "@/services/product.service";
import { ApiCategory } from "@/services/category.service";
import { calculateStockStatus, StockStatus } from "@/lib/stock";
import { TableSkeleton } from "@/components/shared/LoadingSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { PackageSearch, X, Filter } from "lucide-react";
import { ProductStatusBadge } from "./ProductStatusBadge";
import Link from "next/link";
import { MoreHorizontal, Search, Trash, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductTableProps {
  data: ApiProduct[];
  categories?: ApiCategory[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
  onCategoryFilterChange?: (categoryId: string) => void;
  selectedCategoryId?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onClearFilters?: () => void;
  stockFilter?: string;
  onStockFilterChange?: (filter: string) => void;
}

export function ProductTable({ 
  data, 
  categories = [], 
  isLoading = false, 
  onDelete, 
  onCategoryFilterChange, 
  selectedCategoryId = "",
  searchTerm = "",
  onSearchChange,
  onClearFilters,
  stockFilter = "all",
  onStockFilterChange
}: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const columns: ColumnDef<ApiProduct>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.getValue("name")}</div>
          <div className="text-xs text-muted-foreground">{row.original.sku}</div>
        </div>
      )
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => {
        const cat = categories.find(c => c.id === row.getValue("categoryId"));
        return <span className="text-muted-foreground">{cat?.name || "Unknown"}</span>;
      }
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("sellingPrice"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "stockStatus",
      header: "Stock",
      cell: ({ row }) => {
        // Since backend doesn't return currentStock in this API yet, we'll gracefully handle it
        const { currentStock, status } = calculateStockStatus(
          (row.original as any).currentStock, 
          row.original.minStockAlert
        );
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{currentStock}</span>
            <ProductStatusBadge type="stock" status={status} />
          </div>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        const { status } = calculateStockStatus(
          (row.original as any).currentStock, 
          row.original.minStockAlert
        );
        return status === value;
      }
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <ProductStatusBadge type="active" isActive={row.getValue("isActive")} />,
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return row.getValue(id) === (value === "active");
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/products/${product.id}`}>View details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/products/${product.id}/edit`}>Edit product</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this product?")) {
                    onDelete?.(product.id);
                  }
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  // Sync external stock filter state with internal table filter
  useEffect(() => {
    if (table) {
      table.getColumn("stockStatus")?.setFilterValue(stockFilter);
    }
  }, [stockFilter, table]);

  const clearAllFilters = () => {
    onClearFilters?.();
    table.getColumn("isActive")?.setFilterValue("all");
    table.getColumn("stockStatus")?.setFilterValue("all");
    setSorting([]);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategoryId,
    table.getColumn("isActive")?.getFilterValue() && table.getColumn("isActive")?.getFilterValue() !== "all",
    table.getColumn("stockStatus")?.getFilterValue() && table.getColumn("stockStatus")?.getFilterValue() !== "all"
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, SKU, barcode..."
                value={searchTerm}
                onChange={(event) => onSearchChange?.(event.target.value)}
                className="pl-8 w-[250px] lg:w-[350px]"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={activeFiltersCount > 0 && !searchTerm ? "border-primary text-primary" : ""}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          {Object.keys(rowSelection).length > 0 && (
            <Button variant="destructive" size="sm">
              Delete Selected ({Object.keys(rowSelection).length})
            </Button>
          )}
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-md border border-border bg-card/50">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category (Backend)</label>
              {categories.length > 0 && onCategoryFilterChange && (
                <select 
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={selectedCategoryId}
                  onChange={(e) => onCategoryFilterChange(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status (Client)</label>
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={(table.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
                onChange={(e) => table.getColumn("isActive")?.setFilterValue(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Stock (Client)</label>
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={stockFilter}
                onChange={(e) => onStockFilterChange?.(e.target.value)}
              >
                <option value="all">All Stock Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sort By (Client)</label>
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={sorting.length > 0 ? `${sorting[0].id}-${sorting[0].desc ? 'desc' : 'asc'}` : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSorting([]);
                  } else {
                    const [id, dir] = val.split("-");
                    setSorting([{ id, desc: dir === "desc" }]);
                  }
                }}
              >
                <option value="">Default</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="sellingPrice-asc">Price (Low to High)</option>
                <option value="sellingPrice-desc">Price (High to Low)</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : data.length === 0 ? (
        <EmptyState 
          icon={PackageSearch}
          title="No Products Found"
          description="You don't have any products in your catalog yet or none match your search."
          actionLabel="Add Product"
          actionHref="/products/new"
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
              table.getRowModel().rows.map((row) => {
                const { status } = calculateStockStatus(
                  (row.original as any).currentStock, 
                  row.original.minStockAlert
                );
                const isOutOfStock = status === "OUT_OF_STOCK";

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-muted/50 ${isOutOfStock ? "bg-red-50/50 hover:bg-red-50" : ""}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
