"use client";
import React from "react";
import { 
  flexRender, 
  getCoreRowModel, 
  SortingState,
  ColumnDef,
  useReactTable,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, Edit, MoreHorizontal, Trash, ArrowUpDown 
} from "lucide-react";
import Link from "next/link";
import { ApiCustomer } from "@/types/customer";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { CustomerPagination } from "./CustomerPagination";
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerUrlState } from "@/hooks/useCustomerUrlState";
import { SecureActionConfirm } from "@/components/shared/SecureActionConfirm";
import { RequireRole } from "@/components/auth/RequireRole";
import { useRouter } from "next/navigation";
import { handleRowClick } from "@/lib/table-utils";

interface CustomerTableProps {
  data: ApiCustomer[];
  isLoading: boolean;
  totalItems: number;
  state: CustomerUrlState;
  updateState: (updates: Partial<CustomerUrlState>) => void;
  rowSelection: RowSelectionState;
  setRowSelection: OnChangeFn<RowSelectionState>;
}

export function CustomerTable({ 
  data, 
  isLoading, 
  totalItems,
  state,
  updateState,
  rowSelection,
  setRowSelection
}: CustomerTableProps) {
  const router = useRouter();

  // Parse sort from string "id-desc" to SortingState
  const sorting: SortingState = state.sort ? (() => {
    const [id, dir] = state.sort.split("-");
    return [{ id, desc: dir === "desc" }];
  })() : [];

  const columns = React.useMemo<ColumnDef<ApiCustomer>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isDesc = column.getIsSorted() === "desc";
            updateState({ sort: `fullName-${isDesc ? 'asc' : 'desc'}` });
          }}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          <span>Name</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium text-foreground">{row.original.fullName}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.phone}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.email || "-"}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <CustomerStatusBadge isActive={row.original.isActive} />,
    },
    {
      id: "hasCustomFields",
      accessorFn: (row) => row.customFields && Object.keys(row.customFields).length > 0,
      header: "Custom Data",
      cell: ({ row }) => {
        const count = row.original.customFields ? Object.keys(row.original.customFields).length : 0;
        return <div className="text-muted-foreground text-sm">{count > 0 ? `${count} fields` : "-"}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isDesc = column.getIsSorted() === "desc";
            updateState({ sort: `createdAt-${isDesc ? 'asc' : 'desc'}` });
          }}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          <span>Joined Date</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original;
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
                  <Link href={`/customers/${customer.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/customers/${customer.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Customer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <RequireRole allowedRoles={["ADMIN"]}>
                  <SecureActionConfirm
                    title="Delete Customer?"
                    description={`Are you sure you want to delete ${customer.fullName}? This action cannot be undone.`}
                    onConfirm={() => {
                      alert("Delete functionality pending implementation.");
                    }}
                    actionLabel="Delete"
                  >
                    <DropdownMenuItem 
                      className="text-destructive" 
                      onSelect={(e: Event) => e.preventDefault()}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </SecureActionConfirm>
                </RequireRole>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }
  ], [updateState]);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalItems / state.size),
    state: {
      sorting,
      rowSelection,
      pagination: {
        pageIndex: state.page,
        pageSize: state.size,
      }
    },
    manualPagination: true,
    manualSorting: true,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: state.page, pageSize: state.size });
        updateState({ page: newState.pageIndex, size: newState.pageSize });
      }
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <DataTableViewOptions table={table} />
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
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
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: state.size || 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-muted/50">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  tabIndex={0}
                  onClick={(e) => handleRowClick(e, router, `/customers/${row.original.id}`)}
                  onKeyDown={(e) => handleRowClick(e, router, `/customers/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  No customers on this page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && totalItems > 0 && (
        <CustomerPagination table={table} totalItems={totalItems} />
      )}
    </div>
  );
}
