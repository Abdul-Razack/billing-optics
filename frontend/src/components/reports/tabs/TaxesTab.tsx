"use client";

import { useEffect, useState } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { Receipt, DollarSign, Loader2 } from "lucide-react";
import { ReportService, PaymentSummaryData } from "@/services/report.service";

export function TaxesTab() {
  const [data, setData] = useState<PaymentSummaryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get first day of current month as default start date
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const summary = await ReportService.getPaymentSummary(startDate.toISOString(), new Date().toISOString());
        setData(summary);
      } catch (error) {
        console.error("Failed to fetch taxes/payment data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPayments = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportCard 
          title="Total Payments Received" 
          value={`₹${totalPayments.toLocaleString()}`} 
          icon={Receipt}
          description="Current Month"
        />
        {/* Placeholder for GST until GST service is built */}
        <ReportCard 
          title="Taxable Value (Estimate)" 
          value={`₹${Math.round(totalPayments * 0.9).toLocaleString()}`} 
          icon={DollarSign}
          description="Current Month"
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Collection by Payment Method</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.length > 0 ? (
            data.map((method, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col">
                <span className="text-sm text-muted-foreground uppercase">{method.paymentMethod}</span>
                <span className="text-2xl font-bold mt-1">₹{method.total.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No payments collected in this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
