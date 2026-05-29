"use client";

import { useState, useEffect, useMemo } from "react";
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
import { calculateStockStatus } from "@/lib/stock";
import { formatCurrency } from "@/lib/utils";
import { TableSkeleton } from "@/components/shared/LoadingSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { PackageSearch, X, Filter, LayoutGrid, List, Image as ImageIcon, Search } from "lucide-react";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductActionsDropdown } from "./ProductActionsDropdown";
import { ProductGridCard } from "./ProductGridCard";
import { ProductPagination } from "./ProductPagination";

interface ProductListTableProps {
  data: ApiProduct[];
  categories?: ApiCategory[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
  onQuickStockUpdate?: (product: ApiProduct) => void;
  onCategoryFilterChange?: (categoryId: string) => void;
  selectedCategoryId?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onClearFilters?: () => void;
  stockFilter?: string;
  onStockFilterChange?: (filter: string) => void;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function ProductListTable({ 
  data, 
  categories = [], 
  isLoading = false, 
  onDelete,
  onQuickStockUpdate,
  onCategoryFilterChange, 
  selectedCategoryId = "",
  searchTerm = "",
  onSearchChange,
  onClearFilters,
  stockFilter = "all",
  onStockFilterChange,
  rowSelection = {},
  onRowSelectionChange
}: ProductListTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  // Use internal state only if parent doesn't provide one
  const [internalRowSelection, setInternalRowSelection] = useState({});
  const activeRowSelection = onRowSelectionChange ? rowSelection : internalRowSelection;
  const setActiveRowSelection = onRowSelectionChange || setInternalRowSelection;

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Persisted view mode
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  useEffect(() => {
    const saved = localStorage.getItem("productViewMode");
    if (saved === "table" || saved === "grid") setViewMode(saved);
  }, []);

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("productViewMode", mode);
  };

  const columns = useMemo<ColumnDef<ApiProduct>[]>(() => [
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
      id: "image",
      header: "Image",
      cell: () => (
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border border-border">
          <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
        </div>
      ),
      enableSorting: false,
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
        const formatted = formatCurrency(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "stockStatus",
      header: "Stock",
      cell: ({ row }) => {
        const { currentStock, status } = calculateStockStatus(
          row.original.stock ?? (row.original as any).currentStock, 
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
          row.original.stock ?? (row.original as any).currentStock, 
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
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        const dateStr = row.getValue("updatedAt") as string;
        if (!dateStr) return <span className="text-muted-foreground">-</span>;
        const formattedDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
        return <span className="text-sm">{formattedDate}</span>;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ProductActionsDropdown 
          product={row.original} 
          onDelete={onDelete} 
          onQuickStockUpdate={onQuickStockUpdate} 
        />
      ),
    },
  ], [categories, onDelete, onQuickStockUpdate]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setActiveRowSelection,
    state: {
      sorting,
      rowSelection: activeRowSelection,
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {Object.keys(activeRowSelection).length > 0 ? (
            <span>{Object.keys(activeRowSelection).length} selected</span>
          ) : (
            <span>{data.length} products total</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => handleViewModeChange("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => handleViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : data.length === 0 ? (
        <EmptyState 
          icon={PackageSearch}
          title="No Products Found"
          description="You don't have any products in your catalog yet or none match your search."
          actionLabel="Add Product"
          actionHref="/products/create"
        />
      ) : (
        <>
          {viewMode === "table" ? (
            <div className="rounded-md border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                      const { status } = calculateStockStatus(
                        row.original.stock ?? (row.original as any).currentStock, 
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {table.getRowModel().rows.map((row) => (
                <ProductGridCard 
                  key={row.id}
                  product={row.original}
                  category={categories.find(c => c.id === row.original.categoryId)}
                  onDelete={onDelete}
                  onQuickStockUpdate={onQuickStockUpdate}
                  isSelected={row.getIsSelected()}
                  onToggleSelection={(selected) => row.toggleSelected(selected)}
                />
              ))}
            </div>
          )}

          <ProductPagination 
            page={table.getState().pagination.pageIndex}
            size={table.getState().pagination.pageSize}
            totalElements={table.getFilteredRowModel().rows.length}
            onPageChange={table.setPageIndex}
            onSizeChange={table.setPageSize}
          />
        </>
      )}
    </div>
  );
}
