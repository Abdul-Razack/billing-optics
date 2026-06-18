"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fetchClient } from '@/lib/api-client';

export default function DailyStatementPage() {
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatement = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchClient<{ success: boolean; data: any }>(`/reports/daily-statement?date=${date}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to load daily statement", error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div className="p-8">Loading statement...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Non-printable controls */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold">Daily Statement</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Statement
          </Button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="print-area space-y-6">
        <div className="text-center mb-8 border-b pb-4">
          <h2 className="text-3xl font-bold uppercase tracking-wider">Billing Optics</h2>
          <p className="text-gray-600 mt-1">Daily Financial Statement</p>
          <p className="text-sm font-medium mt-2">Date: {format(new Date(date), 'PPP')}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="print:shadow-none print:border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sales Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Invoices Generated</span>
                  <span className="font-semibold">{data.sales?.totalInvoices || 0}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Gross Sales</span>
                  <span className="font-bold text-green-600">
                    ₹{(data.sales?.totalSales || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Returns & Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Returns Processed</span>
                  <span className="font-semibold">{data.returns?.totalReturns || 0}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Total Refunds</span>
                  <span className="font-bold text-red-600">
                    -₹{(data.returns?.totalRefunds || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Collection by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {data.payments?.length > 0 ? (
              <div className="space-y-2">
                {data.payments.map((p: any) => (
                  <div key={p.method} className="flex justify-between items-center p-2 bg-gray-50 rounded print:bg-transparent print:border-b">
                    <span className="font-medium">{p.method}</span>
                    <span className="font-bold">₹{(p.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-2 mt-4 border-t-2 border-black pt-2">
                  <span className="font-bold uppercase">Net Collection</span>
                  <span className="font-bold text-xl">
                    ₹{data.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No payments collected on this date.</p>
            )}
          </CardContent>
        </Card>
        
        <div className="pt-16 flex justify-between px-8 print:block">
          <div className="text-center">
            <div className="w-48 border-b border-black mb-2"></div>
            <p className="text-sm font-medium">Cashier Signature</p>
          </div>
          <div className="text-center print:mt-16">
            <div className="w-48 border-b border-black mb-2"></div>
            <p className="text-sm font-medium">Manager Signature</p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
