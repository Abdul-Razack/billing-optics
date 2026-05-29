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
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types/invoice";
import { MOCK_CUSTOMERS } from "@/lib/mock-customer-data";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import Link from "next/link";
import { MoreHorizontal, Search, Printer, Eye, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InvoiceTableProps {
  data: Invoice[];
}

export function InvoiceTable({ data }: InvoiceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.getValue("invoiceNumber")}</div>
      )
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return <div className="text-muted-foreground">{date.toLocaleDateString()}</div>;
      }
    },
    {
      accessorKey: "customerId",
      header: "Customer",
      cell: ({ row }) => {
        const customer = MOCK_CUSTOMERS.find(c => c.id === row.getValue("customerId"));
        return <div className="text-muted-foreground">{customer?.fullName || "Walk-in Customer"}</div>;
      }
    },
    {
      accessorKey: "grandTotal",
      header: "Total",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("grandTotal"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <InvoiceStatusBadge type="invoice" status={row.getValue("status")} />
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => <InvoiceStatusBadge type="payment" paymentStatus={row.getValue("paymentStatus")} />
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;
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
                  <Link href={`/invoices/${invoice.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
                {invoice.status !== "CANCELLED" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Invoice
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
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
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8"
          />
        </div>
        {/* Placeholder for status/date filters */}
      </div>
      
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
                  className="hover:bg-muted/50"
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
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} invoices
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
