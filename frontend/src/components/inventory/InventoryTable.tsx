"use client";

import { useState } from "react";
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
import { InventoryTransaction } from "@/types/inventory";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { InventoryFilters } from "./InventoryFilters";
import { useRouter } from "next/navigation";
import { handleRowClick } from "@/lib/table-utils";

interface InventoryTableProps {
  data: InventoryTransaction[];
}

export function InventoryTable({ data }: InventoryTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<InventoryTransaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div>
            <div className="font-medium text-sm">{date.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "productId",
      header: "Product",
      cell: ({ row }) => {
        const product = MOCK_PRODUCTS.find(p => p.id === row.getValue("productId"));
        return (
          <div>
            <div className="font-medium text-sm">{product?.name || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">{product?.sku}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <TransactionTypeBadge type={row.getValue("type")} />
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Qty Change</div>,
      cell: ({ row }) => {
        const qty = parseInt(row.getValue("quantity"));
        const isPositive = qty > 0;
        return (
          <div className={`text-right font-medium ${isPositive ? "text-green-600" : "text-destructive"}`}>
            {isPositive ? "+" : ""}{qty}
          </div>
        );
      }
    },
    {
      accessorKey: "referenceId",
      header: "Reference",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("referenceId") || "—"}</div>
    },
    {
      accessorKey: "createdBy",
      header: "User",
      cell: ({ row }) => <div className="text-sm">{row.getValue("createdBy")}</div>
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={row.getValue("notes")}>
          {row.getValue("notes") || "—"}
        </div>
      )
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
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      <InventoryFilters globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
      
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  tabIndex={0}
                  onClick={(e) => handleRowClick(e, router, `/products/${row.original.productId}`)}
                  onKeyDown={(e) => handleRowClick(e, router, `/products/${row.original.productId}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No inventory transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} transactions
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
