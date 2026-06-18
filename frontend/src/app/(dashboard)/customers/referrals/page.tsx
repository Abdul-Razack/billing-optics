"use client";

import { useState, useEffect } from "react";
import { fetchClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Trophy, Handshake, ArrowRight, Gift } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

interface Referrer {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  createdAt: string;
  referralCount: number;
  loyaltyPoints: number;
}

export default function ReferralsPage() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferrers = async () => {
    try {
      const res = await fetchClient<{ success: boolean; data: Referrer[] }>("/customers/reports/referrals?limit=50");
      setReferrers(res.data || []);
    } catch (error) {
      toast.error("Failed to load referral network");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalReferrals = referrers.reduce((acc, r) => acc + r.referralCount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referral Network</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Top customers who refer new business to your store.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leaderboard Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Referrers Leaderboard
            </CardTitle>
            <CardDescription>
              Customers with the most successful referrals
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {referrers.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Handshake className="h-10 w-10 mb-3 opacity-20" />
                  <p>No referrals found yet.</p>
                  <p className="text-sm">When you create a customer, set the &quot;Referred By&quot; field.</p>
                </div>
              ) : (
                referrers.map((referrer, index) => (
                  <div key={referrer.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                        index === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-300' :
                        index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                        'bg-primary/10 text-primary'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          <Link href={`/customers/${referrer.id}`}>
                            {referrer.fullName}
                          </Link>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {referrer.phone} {referrer.email && `• ${referrer.email}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-md">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span className="font-bold tabular-nums text-foreground">{referrer.referralCount}</span>
                        <span className="text-xs text-muted-foreground">referrals</span>
                      </div>
                      {referrer.loyaltyPoints > 0 && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          {referrer.loyaltyPoints} loyalty pts
                        </div>
                      )}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Network Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalReferrals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total clients acquired via referrals
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Advocate</CardTitle>
            </CardHeader>
            <CardContent>
              {referrers.length > 0 ? (
                <>
                  <div className="text-xl font-bold truncate">{referrers[0].fullName}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Brought in {referrers[0].referralCount} new customers
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data yet</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Handshake className="h-4 w-4 text-primary" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>When you create a new customer, you can select an existing customer in the <strong>&quot;Referred By&quot;</strong> field.</p>
              <p>The checkout engine will automatically award <strong>50 loyalty points</strong> to the referrer when the new customer makes their first purchase.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
