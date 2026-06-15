"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shortcut, ShortcutService } from "@/services/shortcut.service";
import { ProductService, ApiProduct } from "@/services/product.service";
import { toast } from "sonner";
import { Trash2, Loader2, Keyboard } from "lucide-react";

export function PosShortcuts() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newKey, setNewKey] = useState("");
  const [newProductId, setNewProductId] = useState<number | "">("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [shortcutsData, productsData] = await Promise.all([
        ShortcutService.getAllShortcuts(),
        ProductService.getProducts({}),
      ]);
      setShortcuts(shortcutsData);
      setProducts(productsData || []);
    } catch (error) {
      toast.error("Failed to load shortcuts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newKey.trim() || newProductId === "") {
      toast.error("Please provide both a shortcut key and select a product.");
      return;
    }

    try {
      setIsAdding(true);
      const added = await ShortcutService.createShortcut(newKey, newProductId);
      setShortcuts([added, ...shortcuts]);
      setNewKey("");
      setNewProductId("");
      toast.success("Shortcut added successfully");
      loadData(); // refresh to get product name
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add shortcut");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ShortcutService.deleteShortcut(id);
      setShortcuts(shortcuts.filter(s => s.id !== id));
      toast.success("Shortcut removed");
    } catch (error) {
      toast.error("Failed to remove shortcut");
    }
  };

  if (isLoading) {
    return (
      <SettingsSection title="POS Shortcuts" description="Manage quick-add keys for the checkout screen.">
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title="POS Shortcuts" description="Map short keyboard keys to specific products to instantly add them during checkout.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-muted/50 p-4 rounded-lg border">
          <div className="space-y-2">
            <Label>Shortcut Key (e.g. '1', 'A')</Label>
            <Input 
              placeholder="Enter key..." 
              value={newKey} 
              onChange={(e) => setNewKey(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Map to Product</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newProductId}
              onChange={(e) => setNewProductId(Number(e.target.value))}
            >
              <option value="" disabled>Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleAdd} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Shortcut"}
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Shortcut Key</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No shortcuts configured yet.
                  </td>
                </tr>
              ) : (
                shortcuts.map((shortcut) => (
                  <tr key={shortcut.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary font-mono font-bold text-xs border border-primary/20">
                        <Keyboard className="h-3 w-3" />
                        {shortcut.shortcutKey}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {shortcut.productName}
                      {shortcut.productSku && <span className="text-muted-foreground ml-2 text-xs font-normal">({shortcut.productSku})</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(shortcut.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsSection>
  );
}
