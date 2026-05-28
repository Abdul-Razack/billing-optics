"use client";

import { InvoiceItem } from "@/types/invoice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CartTableProps {
  items: InvoiceItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onRemove: (id: string) => void;
}

export function CartTable({ items, onUpdateQuantity, onUpdatePrice, onRemove }: CartTableProps) {
  if (items.length === 0) {
    return (
      <div className="border border-border rounded-md border-dashed p-8 text-center bg-muted/20">
        <p className="text-sm text-muted-foreground">No items added to invoice yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Search and select products to add them.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="w-[100px]">Qty</TableHead>
            <TableHead className="w-[120px]">Unit Price</TableHead>
            <TableHead className="w-[100px] text-right">Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium text-sm">{item.productName}</div>
                <div className="text-xs text-muted-foreground">{item.sku}</div>
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  min="1" 
                  value={item.quantity} 
                  onChange={(e) => onUpdateQuantity(item.id, Number(e.target.value) || 1)}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-muted-foreground text-sm">$</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={item.unitPrice} 
                    onChange={(e) => onUpdatePrice(item.id, Number(e.target.value) || 0)}
                    className="h-8 pl-6"
                  />
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                ${item.total.toFixed(2)}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
