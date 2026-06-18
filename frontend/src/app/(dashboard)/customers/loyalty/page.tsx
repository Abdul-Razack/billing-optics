"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gift, Medal, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  loyaltyPoints: number;
}

export default function LoyaltyPage() {
  const { data: res, isLoading, error } = useFetch<{ success: boolean; data: Customer[] }>("/customers/reports/loyalty?limit=100");
  const customers = res?.data || [];

  if (error) {
    toast.error("Failed to load loyalty leaderboard");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPointsInCirculation = customers.reduce((acc, c) => acc + c.loyaltyPoints, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loyalty Program</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Top customers ranked by their loyalty point balance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leaderboard Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Medal className="h-5 w-5 text-indigo-500" />
              Loyalty Leaderboard
            </CardTitle>
            <CardDescription>
              Customers with the highest unredeemed point balances
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {customers.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Gift className="h-10 w-10 mb-3 opacity-20" />
                  <p>No loyalty points have been awarded yet.</p>
                  <p className="text-sm mt-1">Points are automatically awarded during checkout.</p>
                </div>
              ) : (
                customers.map((customer, index) => (
                  <div key={customer.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        index === 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                        index === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-300' :
                        index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                        'bg-primary/10 text-primary'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          <Link href={`/customers/${customer.id}`}>
                            {customer.fullName}
                          </Link>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-800/30">
                        <Gift className="h-4 w-4 text-indigo-500" />
                        <span className="font-bold tabular-nums text-indigo-700 dark:text-indigo-400 text-lg leading-none">{customer.loyaltyPoints}</span>
                        <span className="text-xs text-indigo-500 dark:text-indigo-300/70 uppercase tracking-wider font-semibold">pts</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Unredeemed Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalPointsInCirculation.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Value: ₹{(totalPointsInCirculation).toLocaleString()} off future sales
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p><strong>Earning:</strong> The checkout engine automatically awards 1 point for every ₹100 spent on an invoice.</p>
              <p><strong>Redeeming:</strong> During checkout, you can apply a customer&apos;s points balance as a flat discount to their bill. 1 point = ₹1 off.</p>
            </CardContent>
          </Card>

          <Button asChild className="w-full" variant="outline">
            <Link href="/customers">
              <User className="mr-2 h-4 w-4" />
              View All Customers
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
