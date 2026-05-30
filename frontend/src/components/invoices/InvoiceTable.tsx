"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { ApiInvoice } from "@/types/invoice";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import Link from "next/link";
import { MoreHorizontal, Printer, Eye, XCircle, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceUrlState } from "@/hooks/useInvoiceUrlState";
import { useRouter } from "next/navigation";
import { handleRowClick } from "@/lib/table-utils";

interface InvoiceTableProps {
  data: ApiInvoice[];
  isLoading?: boolean;
  totalItems: number;
  state: InvoiceUrlState;
  updateState: (updates: Partial<InvoiceUrlState>) => void;
}

export function InvoiceTable({ data, isLoading, totalItems, state, updateState }: InvoiceTableProps) {
  const router = useRouter();
  
  const handleSort = (field: string) => {
    const currentField = state.sort.split("-")[0];
    const currentDir = state.sort.split("-")[1];
    
    if (currentField === field) {
      updateState({ sort: currentDir === "asc" ? `${field}-desc` : `${field}-asc` });
    } else {
      updateState({ sort: `${field}-desc` });
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    const currentField = state.sort.split("-")[0];
    const currentDir = state.sort.split("-")[1];
    
    if (currentField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    return currentDir === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const columns: ColumnDef<ApiInvoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.getValue("invoiceNumber")}</div>
      )
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => handleSort("date")}>
          Date
          <SortIcon field="date" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-muted-foreground">{date.toLocaleDateString()}</div>;
      }
    },
    {
      accessorKey: "customerName",
      header: () => (
        <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => handleSort("customer")}>
          Customer
          <SortIcon field="customer" />
        </Button>
      ),
      cell: ({ row }) => {
        return <div className="text-muted-foreground">{row.getValue("customerName")}</div>;
      }
    },
    {
      accessorKey: "grandTotal",
      header: () => (
        <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => handleSort("amount")}>
          Total
          <SortIcon field="amount" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number(row.getValue("grandTotal")) / 100;
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
    // Pagination and sorting are handled server-side now
  });

  const totalPages = Math.ceil(totalItems / state.size);
  const isFirstPage = state.page === 0;
  const isLastPage = state.page >= totalPages - 1;

  return (
    <div className="space-y-4">
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
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                   Loading invoices...
                 </TableCell>
               </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  tabIndex={0}
                  onClick={(e) => handleRowClick(e, router, `/invoices/${row.original.id}`)}
                  onKeyDown={(e) => handleRowClick(e, router, `/invoices/${row.original.id}`)}
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
          Showing {data.length > 0 ? state.page * state.size + 1 : 0} to {Math.min((state.page + 1) * state.size, totalItems)} of {totalItems} invoices
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateState({ page: state.page - 1 })}
            disabled={isFirstPage || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateState({ page: state.page + 1 })}
            disabled={isLastPage || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
