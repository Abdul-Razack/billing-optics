"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Users, PackageSearch } from 'lucide-react';
import { fetchClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BulkRow {
  id: string;
  productId: number | '';
  productSearch: string;
  employeeName: string;
  quantity: number;
  unitPrice: number;
}

export default function BulkInvoicePage() {
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [rows, setRows] = useState<BulkRow[]>([
    { id: '1', productId: '', productSearch: '', employeeName: '', quantity: 1, unitPrice: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Basic fetchers (simplified for bulk UI)
  useEffect(() => {
    if (customerSearch.length > 2) {
      fetchClient<{ data: any[] }>(`/customers?search=${customerSearch}`).then(res => setCustomers(res.data));
    }
  }, [customerSearch]);

  const searchProducts = async (query: string, rowIndex: number) => {
    if (query.length > 2) {
      const res = await fetchClient<{ data: any[] }>(`/products?search=${query}`);
      setProducts(res.data);
    }
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), productId: '', productSearch: '', employeeName: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (index: number, field: keyof BulkRow, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    
    // Auto-fill price if product selected
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        newRows[index].unitPrice = product.sellingPrice;
        newRows[index].productSearch = product.name; // Keep name for display
      }
    }
    
    setRows(newRows);
  };

  const calculateTotal = () => {
    return rows.reduce((sum, row) => sum + (row.unitPrice * row.quantity), 0);
  };

  const handleSubmit = async () => {
    if (!customerId) {
      toast.error("Please select a Corporate Customer");
      return;
    }

    const validRows = rows.filter(r => r.productId && r.quantity > 0);
    if (validRows.length === 0) {
      toast.error("Please fill in all product fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customerId,
        items: validRows.map(r => ({
          productId: r.productId,
          quantity: r.quantity,
          employeeName: r.employeeName || undefined
        })),
        payments: [] // Bulk invoices are usually unpaid/credit initially
      };

      const res = await fetchClient<{ invoiceId: number }>('/bulk-invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success("Invoices processed successfully");
      router.push(`/sales/invoices/${res.invoiceId}`);
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to process invoices");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Bulk Invoice</h1>
        <p className="text-gray-500">Rapidly generate a single invoice for multiple corporate employees.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5"/> Corporate Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Input 
              placeholder="Search customer by name or phone..." 
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="mb-2"
            />
            {customers.length > 0 && !customerId && (
              <div className="border rounded-md shadow-sm max-h-40 overflow-y-auto">
                {customers.map(c => (
                  <div 
                    key={c.id} 
                    className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => { setCustomerId(c.id); setCustomerSearch(c.fullName); setCustomers([]); }}
                  >
                    <span className="font-medium">{c.fullName}</span> - {c.phone}
                  </div>
                ))}
              </div>
            )}
            {customerId && (
              <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                ✓ Selected Customer ID: {customerId}
                <Button variant="link" size="sm" onClick={() => { setCustomerId(''); setCustomerSearch(''); }} className="text-red-500 h-auto p-0">Clear</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2"><PackageSearch className="w-5 h-5"/> Bulk Items Entry</CardTitle>
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-2"/> Add Row</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 font-medium w-12">#</th>
                  <th className="p-3 font-medium w-1/3">Product Search</th>
                  <th className="p-3 font-medium w-1/4">Employee Name (Opt)</th>
                  <th className="p-3 font-medium w-24">Qty</th>
                  <th className="p-3 font-medium w-32">Unit Price</th>
                  <th className="p-3 font-medium w-32">Total</th>
                  <th className="p-3 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="p-3 text-gray-500">{index + 1}</td>
                    <td className="p-3">
                      <div className="relative">
                        <Input 
                          placeholder="Search product..."
                          value={row.productSearch}
                          onChange={(e) => {
                            updateRow(index, 'productSearch', e.target.value);
                            searchProducts(e.target.value, index);
                          }}
                        />
                        {products.length > 0 && row.productSearch.length > 2 && !row.productId && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {products.map(p => (
                              <div 
                                key={p.id} 
                                className="p-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                                onClick={() => {
                                  updateRow(index, 'productId', p.id);
                                  setProducts([]); // clear search
                                }}
                              >
                                {p.name} - ₹{p.sellingPrice} (Stock: {p.stockCount})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Input 
                        placeholder="e.g. John Doe"
                        value={row.employeeName}
                        onChange={(e) => updateRow(index, 'employeeName', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <Input 
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => updateRow(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </td>
                    <td className="p-3">
                      ₹{row.unitPrice}
                    </td>
                    <td className="p-3 font-medium">
                      ₹{row.unitPrice * row.quantity}
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => removeRow(row.id)} disabled={rows.length === 1}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 pt-6">
          <div className="text-lg">
            <span className="text-gray-500 mr-2">Estimated Grand Total:</span>
            <span className="font-bold text-xl">₹{calculateTotal().toLocaleString()}</span>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting || !customerId} className="min-w-[200px]">
            {isSubmitting ? "Processing..." : <><Save className="w-4 h-4 mr-2" /> Generate Bulk Invoice</>}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
